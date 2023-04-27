import os
import re
import shlex
import sys
import traceback
from argparse import Namespace
from pathlib import Path
from typing import Union

import click
from compel import PromptParser

if sys.platform == "darwin":
    os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

import pyparsing  # type: ignore

import invokeai.version as invokeai
import invokeai.backend.util.logging as logger

from ...backend import ModelManager
from ...backend.args import Args, dream_cmd_from_png, metadata_dumps, metadata_from_png
from ...backend.globals import Globals, global_config_dir
from ...backend.image_util import (
    PngWriter,
    make_grid,
    retrieve_metadata,
    write_metadata,
)
from ...backend.stable_diffusion import PipelineIntermediateState
from ...backend.util import url_attachment_name, write_log
from .readline import Completer, get_completer
from ...backend.onnx import ONNX
from ...backend.pytorch import Pytorch

# global used in multiple functions (fix)
infile = None


def main():
    """Initialize command-line parsers and the diffusion model"""
    global infile

    opt = Args()
    args = opt.parse_args()
    modeltype = None
    if not args:
        sys.exit(-1)

    # load the infile as a list of lines
    if opt.infile:
        try:
            if os.path.isfile(opt.infile):
                infile = open(opt.infile, "r", encoding="utf-8")
            elif opt.infile == "-":  # stdin
                infile = sys.stdin
            else:
                raise FileNotFoundError(f"{opt.infile} not found.")
        except (FileNotFoundError, IOError) as e:
            print(f"{e}. Aborting.")
            sys.exit(-1)

    print(f">> {invokeai.__app_name__}, version {invokeai.__version__}")
    print(f'>> InvokeAI runtime directory is "{Globals.root}"')

    Globals.internet_available = args.internet_available and check_internet()
    print(f">> Internet connectivity is {Globals.internet_available}")

    if not args.conf:
        config_file = os.path.join(Globals.root, "configs", "models.yaml")
        if not os.path.exists(config_file):
            report_model_error(
                opt, FileNotFoundError(f"The file {config_file} could not be found.")
            )

    # normalize the config directory relative to root
    if not os.path.isabs(opt.conf):
        opt.conf = os.path.normpath(os.path.join(Globals.root, opt.conf))

    if opt.modelType == "Pytorch":
        #invocation of pytorch model
        opt = Pytorch.start(opt, args)

        # Loading Face Restoration and ESRGAN Modules
        gfpgan, codeformer, esrgan = load_face_restoration(opt)

        if opt.embeddings:
            if not os.path.isabs(opt.embedding_path):
                embedding_path = os.path.normpath(
                    os.path.join(Globals.root, opt.embedding_path)
                )
            else:
                embedding_path = opt.embedding_path
        else:
            embedding_path = None

        try:
            modeltype = Pytorch(
                conf=opt.conf,
                model=opt.model,
                sampler_name=opt.sampler_name,
                embedding_path=embedding_path,
                full_precision=opt.full_precision,
                precision=opt.precision,
                gfpgan=gfpgan,
                codeformer=codeformer,
                esrgan=esrgan,
                free_gpu_mem=opt.free_gpu_mem,
                safety_checker=opt.safety_checker,
                max_loaded_models=opt.max_loaded_models,
            )
        except (FileNotFoundError, TypeError, AssertionError) as e:
            report_model_error(opt, e)
        except (IOError, KeyError) as e:
            print(f"{e}. Aborting.")
            sys.exit(-1)

        # preload the model
        # loading here to avoid long delays on startup
        try:
            modeltype.load_model()
        except KeyError:
            pass
        except Exception as e:
            report_model_error(opt, e)

        # try to autoconvert new models
        if path := opt.autoimport:
            modeltype.model_manager.heuristic_import(
                str(path), convert=False, commit_to_conf=opt.conf
            )

        if path := opt.autoconvert:
            modeltype.model_manager.heuristic_import(
                str(path), convert=True, commit_to_conf=opt.conf
            )

        # Loading Face Restoration and ESRGAN Modules
        gfpgan, codeformer, esrgan = load_face_restoration(opt)

        # web server loops forever
        print("web and gui options: ", opt.gui, opt.web)
        if opt.web or opt.gui:
            invoke_ai_web_server_loop(modeltype, gfpgan, codeformer, esrgan)
            sys.exit(0)

    elif opt.modelType == "Onnx":
        #Invocation of onnx pipeline
        try:
            modeltype = ONNX(
                model=opt.model,
                precision=opt.precision,
            )
        except (FileNotFoundError, TypeError, AssertionError) as e:
            report_model_error(opt, e)
        except (IOError, KeyError) as e:
            print(f"{e}. Aborting.")
            sys.exit(-1)
    else:
        print(" Aborting. modelType chosen is not defined.")
        sys.exit(-1)

    # these two lines prevent a horrible warning message from appearing
    # when the frozen CLIP tokenizer is imported
    import transformers  # type: ignore

    transformers.logging.set_verbosity_error()
    import diffusers

    diffusers.logging.set_verbosity_error()

    if not infile:
        print(
            "\n* Initialization done! Awaiting your command (-h for help, 'q' to quit)"
        )

    try:
        main_loop(modeltype, opt)
    except KeyboardInterrupt:
        print(
            f'\nGoodbye!\nYou can start InvokeAI again by running the "invoke.bat" (or "invoke.sh") script from {Globals.root}'
        )
    except Exception:
        logger.error("An error occurred",exc_info=True)

# TODO: main_loop() has gotten busy. Needs to be refactored.
def main_loop(gen, opt):
    """prompt/read/execute loop"""
    global infile
    done = False
    doneAfterInFile = infile is not None
    path_filter = re.compile(r'[<>:"/\\|?*]')
    last_results = list()

    completer = gen.getCompleter(opt)
    # The readline completer reads history from the .dream_history file located in the
    # output directory specified at the time of script launch. We do not currently support
    # changing the history file midstream when the output directory is changed.
    set_default_output_dir(opt, completer)
    if gen.model and isinstance(gen, Pytorch):
        add_embedding_terms(gen, completer)
    output_cntr = completer.get_current_history_length() + 1

    # os.pathconf is not available on Windows
    if hasattr(os, "pathconf"):
        path_max = os.pathconf(opt.outdir, "PC_PATH_MAX")
        name_max = os.pathconf(opt.outdir, "PC_NAME_MAX")
    else:
        path_max = 260
        name_max = 255

    while not done:
        operation = "generate"

        try:
            command = get_next_command(infile, gen.model_name)
        except EOFError:
            done = infile is None or doneAfterInFile
            infile = None
            continue

        # skip empty lines
        if not command.strip():
            continue

        if command.startswith(("#", "//")):
            continue

        if len(command.strip()) == 1 and command.startswith("q"):
            done = True
            break

        if not command.startswith("!history"):
            completer.add_history(command)

        if command.startswith("!"):
            command, operation = do_command(command, gen, opt, completer)

        if operation is None:
            continue

        if opt.parse_cmd(command) is None:
            continue

        if opt.init_img:
            try:
                if not opt.prompt:
                    oldargs = metadata_from_png(opt.init_img)
                    opt.prompt = oldargs.prompt
                    logger.info(f'Retrieved old prompt "{opt.prompt}" from {opt.init_img}')
            except (OSError, AttributeError, KeyError):
                pass

        if len(opt.prompt) == 0:
            opt.prompt = ""

        # width and height are set by model if not specified
        if not opt.width:
            opt.width = gen.width
        if not opt.height:
            opt.height = gen.height

        # retrieve previous value of init image if requested
        if opt.init_img is not None and re.match("^-\\d+$", opt.init_img):
            try:
                opt.init_img = last_results[int(opt.init_img)][0]
                logger.info(f"Reusing previous image {opt.init_img}")
            except IndexError:
                logger.info(f"No previous initial image at position {opt.init_img} found")
                opt.init_img = None
                continue

        # the outdir can change with each command, so we adjust it here
        set_default_output_dir(opt, completer)

        # try to relativize pathnames
        for attr in ("init_img", "init_mask", "init_color"):
            if getattr(opt, attr) and not os.path.exists(getattr(opt, attr)):
                basename = getattr(opt, attr)
                path = os.path.join(opt.outdir, basename)
                setattr(opt, attr, path)

        # retrieve previous value of seed if requested
        # Exception: for postprocess operations negative seed values
        # mean "discard the original seed and generate a new one"
        # (this is a non-obvious hack and needs to be reworked)
        if opt.seed is not None and opt.seed < 0 and operation != "postprocess":
            try:
                opt.seed = last_results[opt.seed][1]
                logger.info(f"Reusing previous seed {opt.seed}")
            except IndexError:
                logger.info(f"No previous seed at position {opt.seed} found")
                opt.seed = None
                continue

        if opt.strength is None:
            opt.strength = 0.75 if opt.out_direction is None else 0.83

        if opt.with_variations is not None:
            opt.with_variations = split_variations(opt.with_variations)

        if opt.prompt_as_dir and operation == "generate":
            # sanitize the prompt to a valid folder name
            subdir = path_filter.sub("_", opt.prompt)[:name_max].rstrip(" .")

            # truncate path to maximum allowed length
            # 39 is the length of '######.##########.##########-##.png', plus two separators and a NUL
            subdir = subdir[: (path_max - 39 - len(os.path.abspath(opt.outdir)))]
            current_outdir = os.path.join(opt.outdir, subdir)

            logger.info('Writing files to directory: "' + current_outdir + '"')

            # make sure the output directory exists
            if not os.path.exists(current_outdir):
                os.makedirs(current_outdir)
        else:
            if not os.path.exists(opt.outdir):
                os.makedirs(opt.outdir)
            current_outdir = opt.outdir

        # Here is where the images are actually generated!
        last_results = []
        try:
            file_writer = PngWriter(current_outdir)
            results = []  # list of filename, prompt pairs
            grid_images = dict()  # seed -> Image, only used if `opt.grid`
            prior_variations = opt.with_variations or []
            prefix = file_writer.unique_prefix()
            step_callback = (
                make_step_callback(gen, opt, prefix)
                if opt.save_intermediates > 0
                else None
            )

            def image_writer(
                image,
                seed,
                upscaled=False,
                first_seed=None,
                use_prefix=None,
                prompt_in=None,
                attention_maps_image=None,
            ):
                # note the seed is the seed of the current image
                # the first_seed is the original seed that noise is added to
                # when the -v switch is used to generate variations
                nonlocal prior_variations
                nonlocal prefix

                path = None
                if opt.grid:
                    grid_images[seed] = image

                elif operation == "mask":
                    filename = f"{prefix}.{use_prefix}.{seed}.png"
                    tm = opt.text_mask[0]
                    th = opt.text_mask[1] if len(opt.text_mask) > 1 else 0.5
                    formatted_dream_prompt = (
                        f"!mask {opt.input_file_path} -tm {tm} {th}"
                    )
                    path = file_writer.save_image_and_prompt_to_png(
                        image=image,
                        dream_prompt=formatted_dream_prompt,
                        metadata={},
                        name=filename,
                        compress_level=opt.png_compression,
                    )
                    results.append([path, formatted_dream_prompt])

                else:
                    if use_prefix is not None:
                        prefix = use_prefix
                    postprocessed = upscaled if upscaled else operation == "postprocess"
                    opt.prompt = (
                        gen.huggingface_concepts_library.replace_triggers_with_concepts(
                            opt.prompt or prompt_in
                        )
                    )  # to avoid the problem of non-unique concept triggers
                    filename, formatted_dream_prompt = prepare_image_metadata(
                        opt,
                        prefix,
                        seed,
                        operation,
                        prior_variations,
                        postprocessed,
                        first_seed,
                    )
                    path = file_writer.save_image_and_prompt_to_png(
                        image=image,
                        dream_prompt=formatted_dream_prompt,
                        metadata=metadata_dumps(
                            opt,
                            seeds=[
                                seed
                                if opt.variation_amount == 0
                                and len(prior_variations) == 0
                                else first_seed
                            ],
                            model_hash=gen.model_hash,
                        ),
                        name=filename,
                        compress_level=opt.png_compression,
                    )

                    # update rfc metadata
                    if operation == "postprocess":
                        tool = re.match(
                            "postprocess:(\w+)", opt.last_operation
                        ).groups()[0]
                        add_postprocessing_to_metadata(
                            opt,
                            opt.input_file_path,
                            filename,
                            tool,
                            formatted_dream_prompt,
                        )

                    if (not postprocessed) or opt.save_original:
                        # only append to results if we didn't overwrite an earlier output
                        results.append([path, formatted_dream_prompt])

                # so that the seed autocompletes (on linux|mac when -S or --seed specified
                if completer and operation == "generate":
                    completer.add_seed(seed)
                    completer.add_seed(first_seed)
                last_results.append([path, seed])

            if operation == "generate":
                catch_ctrl_c = (
                    infile is None
                )  # if running interactively, we catch keyboard interrupts
                opt.last_operation = "generate"
                try:
                    gen.prompt2image(
                        image_callback=image_writer,
                        step_callback=step_callback,
                        catch_interrupts=catch_ctrl_c,
                        **vars(opt),
                    )
                    sys.exit(-1)
                except (PromptParser.ParsingException, pyparsing.ParseException) as e:
                    print("** An error occurred while processing your prompt **")
                    print(f"** {str(e)} **")
            elif operation == "postprocess":
                logger.info(f"fixing {opt.prompt}")
                opt.last_operation = do_postprocess(gen, opt, image_writer)

            elif operation == "mask":
                logger.info(f"generating masks from {opt.prompt}")
                do_textmask(gen, opt, image_writer)

            if opt.grid and len(grid_images) > 0:
                grid_img = make_grid(list(grid_images.values()))
                grid_seeds = list(grid_images.keys())
                first_seed = last_results[0][1]
                filename = f"{prefix}.{first_seed}.png"
                formatted_dream_prompt = opt.dream_prompt_str(
                    seed=first_seed, grid=True, iterations=len(grid_images)
                )
                formatted_dream_prompt += f" # {grid_seeds}"
                metadata = metadata_dumps(
                    opt, seeds=grid_seeds, model_hash=gen.model_hash
                )
                path = file_writer.save_image_and_prompt_to_png(
                    image=grid_img,
                    dream_prompt=formatted_dream_prompt,
                    metadata=metadata,
                    name=filename,
                )
                results = [[path, formatted_dream_prompt]]

        except AssertionError:
            logger.error(e)
            continue

        except OSError as e:
            logger.error(e)
            continue

        print("Outputs:")
        log_path = os.path.join(current_outdir, "invoke_log")
        output_cntr = write_log(results, log_path, ("txt", "md"), output_cntr)
        print()

    print(
        f'\nGoodbye!\nYou can start InvokeAI again by running the "invoke.bat" (or "invoke.sh") script from {Globals.root}'
    )

def check_internet() -> bool:
        """
        Return true if the internet is reachable.
        It does this by pinging huggingface.co.
        """
        import urllib.request

        host = "http://huggingface.co"
        try:
            urllib.request.urlopen(host, timeout=1)
            return True
        except:
            return False

# TO DO: remove repetitive code and the awkward command.replace() trope
# Just do a simple parse of the command!
def do_command(command: str, gen, opt: Args, completer) -> tuple:
    global infile
    operation = "generate"  # default operation, alternative is 'postprocess'
    command = command.replace("\\", "/")  # windows

    if command.startswith(
        "!dream"
    ):  # in case a stored prompt still contains the !dream command
        command = command.replace("!dream ", "", 1)

    elif command.startswith("!fix"):
        command = command.replace("!fix ", "", 1)
        operation = "postprocess"

    elif command.startswith("!mask"):
        command = command.replace("!mask ", "", 1)
        operation = "mask"

    elif command.startswith("!switch"):
        model_name = command.replace("!switch ", "", 1)
        try:
            gen.set_model(model_name)
            add_embedding_terms(gen, completer)
        except KeyError as e:
            logger.error(e)
        except Exception as e:
            report_model_error(opt, e)
        completer.add_history(command)
        operation = None

    elif command.startswith("!models"):
        gen.model_manager.print_models()
        completer.add_history(command)
        operation = None

    elif command.startswith("!import"):
        path = shlex.split(command)
        if len(path) < 2:
            logger.warning(
                "please provide (1) a URL to a .ckpt file to import; (2) a local path to a .ckpt file; or (3) a diffusers repository id in the form stabilityai/stable-diffusion-2-1"
            )
        else:
            try:
                import_model(path[1], gen, opt, completer)
                completer.add_history(command)
            except KeyboardInterrupt:
                print("\n")
        operation = None

    elif command.startswith(("!convert", "!optimize")):
        path = shlex.split(command)
        if len(path) < 2:
            logger.warning("please provide the path to a .ckpt or .safetensors model")
        else:
            try:
                convert_model(path[1], gen, opt, completer)
                completer.add_history(command)
            except KeyboardInterrupt:
                print("\n")
        operation = None

    elif command.startswith("!edit"):
        path = shlex.split(command)
        if len(path) < 2:
            logger.warning("please provide the name of a model")
        else:
            edit_model(path[1], gen, opt, completer)
        completer.add_history(command)
        operation = None

    elif command.startswith("!del"):
        path = shlex.split(command)
        if len(path) < 2:
            logger.warning("please provide the name of a model")
        else:
            del_config(path[1], gen, opt, completer)
        completer.add_history(command)
        operation = None

    elif command.startswith("!fetch"):
        file_path = command.replace("!fetch", "", 1).strip()
        retrieve_dream_command(opt, file_path, completer)
        completer.add_history(command)
        operation = None

    elif command.startswith("!replay"):
        file_path = command.replace("!replay", "", 1).strip()
        file_path = os.path.join(opt.outdir, file_path)
        if infile is None and os.path.isfile(file_path):
            infile = open(file_path, "r", encoding="utf-8")
        completer.add_history(command)
        operation = None

    elif command.startswith("!trigger"):
        print("Embedding trigger strings: ", ", ".join(gen.embedding_trigger_strings))
        operation = None

    elif command.startswith("!history"):
        completer.show_history()
        operation = None

    elif command.startswith("!search"):
        search_str = command.replace("!search", "", 1).strip()
        completer.show_history(search_str)
        operation = None

    elif command.startswith("!clear"):
        completer.clear_history()
        operation = None

    elif re.match("^!(\d+)", command):
        command_no = re.match("^!(\d+)", command).groups()[0]
        command = completer.get_line(int(command_no))
        completer.set_line(command)
        operation = None

    else:  # not a recognized command, so give the --help text
        command = "-h"
    return command, operation


def set_default_output_dir(opt: Args, completer: Completer):
    """
    If opt.outdir is relative, we add the root directory to it
    normalize the outdir relative to root and make sure it exists.
    """
    if not os.path.isabs(opt.outdir):
        opt.outdir = os.path.normpath(os.path.join(Globals.root, opt.outdir))
    if not os.path.exists(opt.outdir):
        os.makedirs(opt.outdir)
    completer.set_default_dir(opt.outdir)


def import_model(model_path: str, gen, opt, completer):
    """
    model_path can be (1) a URL to a .ckpt file; (2) a local .ckpt file path;
    (3) a huggingface repository id; or (4) a local directory containing a
    diffusers model.
    """
    default_name = Path(model_path).stem
    model_name = None
    model_desc = None

    if (
        Path(model_path).is_dir()
        and not (Path(model_path) / "model_index.json").exists()
    ):
        pass
    else:
        if model_path.startswith(("http:", "https:")):
            try:
                default_name = url_attachment_name(model_path)
                default_name = Path(default_name).stem
            except Exception:
                logger.warning(f"A problem occurred while assigning the name of the downloaded model",exc_info=True)
            model_name, model_desc = _get_model_name_and_desc(
                gen.model_manager,
                completer,
                model_name=default_name,
            )
    imported_name = gen.model_manager.heuristic_import(
        model_path,
        model_name=model_name,
        description=model_desc,
    )

    if not imported_name:
        if config_file := _pick_configuration_file(completer):
            imported_name = gen.model_manager.heuristic_import(
                model_path,
                model_name=model_name,
                description=model_desc,
                model_config_file=config_file,
            )
    if not imported_name:
        logger.error("Aborting import.")
        return

    if not _verify_load(imported_name, gen):
        logger.error("model failed to load. Discarding configuration entry")
        gen.model_manager.del_model(imported_name)
        return
    if click.confirm("Make this the default model?", default=False):
        gen.model_manager.set_default_model(imported_name)

    gen.model_manager.commit(opt.conf)
    completer.update_models(gen.model_manager.list_models())
    logger.info(f"{imported_name} successfully installed")

def _pick_configuration_file(completer)->Path:
    print(
"""
Please select the type of this model:
[1] A Stable Diffusion v1.x ckpt/safetensors model
[2] A Stable Diffusion v1.x inpainting ckpt/safetensors model
[3] A Stable Diffusion v2.x base model (512 pixels)
[4] A Stable Diffusion v2.x v-predictive model (768 pixels)
[5] Other (you will be prompted to enter the config file path)
[Q] I have no idea! Skip the import.
""")
    choices = [
        global_config_dir() / 'stable-diffusion' / x
        for x in [
                'v1-inference.yaml',
                'v1-inpainting-inference.yaml',
                'v2-inference.yaml',
                'v2-inference-v.yaml',
        ]
    ]

    ok = False
    while not ok:
        try:
            choice = input('select 0-5, Q > ').strip()
            if choice.startswith(('q','Q')):
                return
            if choice == '5':
                completer.complete_extensions(('.yaml'))
                choice = Path(input('Select config file for this model> ').strip()).absolute()
                completer.complete_extensions(None)
                ok = choice.exists()
            else:
                choice = choices[int(choice)-1]
                ok = True
        except (ValueError, IndexError):
            print(f'{choice} is not a valid choice')
        except EOFError:
            return
    return choice

def _verify_load(model_name: str, gen) -> bool:
    logger.info("Verifying that new model loads...")
    current_model = gen.model_name
    try:
        if not gen.set_model(model_name):
            return
    except Exception as e:
        logger.warning(f"model failed to load: {str(e)}")
        logger.warning(
            "** note that importing 2.X checkpoints is not supported. Please use !convert_model instead."
        )
        return False
    if click.confirm("Keep model loaded?", default=True):
        gen.set_model(model_name)
    else:
        logger.info("Restoring previous model")
        gen.set_model(current_model)
    return True


def _get_model_name_and_desc(
    model_manager, completer, model_name: str = "", model_description: str = ""
):
    model_name = _get_model_name(model_manager.list_models(), completer, model_name)
    model_description = model_description or f"Imported model {model_name}"
    completer.set_line(model_description)
    model_description = (
        input(f"Description for this model [{model_description}]: ").strip()
        or model_description
    )
    return model_name, model_description

def convert_model(model_name_or_path: Union[Path, str], gen, opt, completer):
    model_name_or_path = model_name_or_path.replace("\\", "/")  # windows
    manager = gen.model_manager
    ckpt_path = None
    original_config_file = None
    if model_name_or_path == gen.model_name:
        logger.warning("Can't convert the active model. !switch to another model first. **")
        return
    elif model_info := manager.model_info(model_name_or_path):
        if "weights" in model_info:
            ckpt_path = Path(model_info["weights"])
            original_config_file = Path(model_info["config"])
            model_name = model_name_or_path
            model_description = model_info["description"]
            vae_path = model_info.get("vae")
        else:
            logger.warning(f"{model_name_or_path} is not a legacy .ckpt weights file")
            return
        model_name = manager.convert_and_import(
            ckpt_path,
            diffusers_path=Path(
                Globals.root, "models", Globals.converted_ckpts_dir, model_name_or_path
            ),
            model_name=model_name,
            model_description=model_description,
            original_config_file=original_config_file,
            vae_path=vae_path,
        )
    else:
        try:
            import_model(model_name_or_path, gen, opt, completer)
        except KeyboardInterrupt:
            return

    manager.commit(opt.conf)
    if click.confirm(f"Delete the original .ckpt file at {ckpt_path}?", default=False):
        ckpt_path.unlink(missing_ok=True)
        logger.warning(f"{ckpt_path} deleted")


def del_config(model_name: str, gen, opt, completer):
    current_model = gen.model_name
    if model_name == current_model:
        logger.warning("Can't delete active model. !switch to another model first. **")
        return
    if model_name not in gen.model_manager.config:
        logger.warning(f"Unknown model {model_name}")
        return

    if not click.confirm(
        f"Remove {model_name} from the list of models known to InvokeAI?", default=True
    ):
        return

    delete_completely = click.confirm(
        "Completely remove the model file or directory from disk?", default=False
    )
    gen.model_manager.del_model(model_name, delete_files=delete_completely)
    gen.model_manager.commit(opt.conf)
    logger.warning(f"{model_name} deleted")
    completer.update_models(gen.model_manager.list_models())


def edit_model(model_name: str, gen, opt, completer):
    manager = gen.model_manager
    if not (info := manager.model_info(model_name)):
        logger.warning(f"** Unknown model {model_name}")
        return
    print()
    logger.info(f"Editing model {model_name} from configuration file {opt.conf}")
    new_name = _get_model_name(manager.list_models(), completer, model_name)

    for attribute in info.keys():
        if type(info[attribute]) != str:
            continue
        if attribute == "format":
            continue
        completer.set_line(info[attribute])
        info[attribute] = input(f"{attribute}: ") or info[attribute]

    if info["format"] == "diffusers":
        vae = info.get("vae", dict(repo_id=None, path=None, subfolder=None))
        completer.set_line(vae.get("repo_id") or "stabilityai/sd-vae-ft-mse")
        vae["repo_id"] = input("External VAE repo_id: ").strip() or None
        if not vae["repo_id"]:
            completer.set_line(vae.get("path") or "")
            vae["path"] = (
                input("Path to a local diffusers VAE model (usually none): ").strip()
                or None
            )
        completer.set_line(vae.get("subfolder") or "")
        vae["subfolder"] = (
            input("Name of subfolder containing the VAE model (usually none): ").strip()
            or None
        )
        info["vae"] = vae

    if new_name != model_name:
        manager.del_model(model_name)

    # this does the update
    manager.add_model(new_name, info, True)

    if click.confirm("Make this the default model?", default=False):
        manager.set_default_model(new_name)
    manager.commit(opt.conf)
    completer.update_models(manager.list_models())
    logger.info("Model successfully updated")


def _get_model_name(existing_names, completer, default_name: str = "") -> str:
    done = False
    completer.set_line(default_name)
    while not done:
        model_name = input(f"Short name for this model [{default_name}]: ").strip()
        if len(model_name) == 0:
            model_name = default_name
        if not re.match("^[\w._+:/-]+$", model_name):
            logger.warning(
                'model name must contain only words, digits and the characters "._+:/-" **'
            )
        elif model_name != default_name and model_name in existing_names:
            logger.warning(f"the name {model_name} is already in use. Pick another.")
        else:
            done = True
    return model_name


def do_textmask(gen, opt, callback):
    image_path = opt.prompt
    if not os.path.exists(image_path):
        image_path = os.path.join(opt.outdir, image_path)
    assert os.path.exists(
        image_path
    ), '** "{opt.prompt}" not found. Please enter the name of an existing image file to mask **'
    assert (
        opt.text_mask is not None and len(opt.text_mask) >= 1
    ), "** Please provide a text mask with -tm **"
    opt.input_file_path = image_path
    tm = opt.text_mask[0]
    threshold = float(opt.text_mask[1]) if len(opt.text_mask) > 1 else 0.5
    gen.apply_textmask(
        image_path=image_path,
        prompt=tm,
        threshold=threshold,
        callback=callback,
    )


def do_postprocess(gen, opt, callback):
    file_path = opt.prompt  # treat the prompt as the file pathname
    if opt.new_prompt is not None:
        opt.prompt = opt.new_prompt
    else:
        opt.prompt = None

    if os.path.dirname(file_path) == "":  # basename given
        file_path = os.path.join(opt.outdir, file_path)

    opt.input_file_path = file_path

    tool = None
    if opt.facetool_strength > 0:
        tool = opt.facetool
    elif opt.embiggen:
        tool = "embiggen"
    elif opt.upscale:
        tool = "upscale"
    elif opt.out_direction:
        tool = "outpaint"
    elif opt.outcrop:
        tool = "outcrop"
    opt.save_original = True  # do not overwrite old image!
    opt.last_operation = f"postprocess:{tool}"
    try:
        gen.apply_postprocessor(
            image_path=file_path,
            tool=tool,
            facetool_strength=opt.facetool_strength,
            codeformer_fidelity=opt.codeformer_fidelity,
            save_original=opt.save_original,
            upscale=opt.upscale,
            upscale_denoise_str=opt.esrgan_denoise_str,
            out_direction=opt.out_direction,
            outcrop=opt.outcrop,
            callback=callback,
            opt=opt,
        )
    except OSError:
        logger.error(f"{file_path}: file could not be read",exc_info=True)
        return
    except (KeyError, AttributeError):
        logger.error(f"an error occurred while applying the {tool} postprocessor",exc_info=True)
        return
    return opt.last_operation


def add_postprocessing_to_metadata(opt, original_file, new_file, tool, command):
    original_file = (
        original_file
        if os.path.exists(original_file)
        else os.path.join(opt.outdir, original_file)
    )
    new_file = (
        new_file if os.path.exists(new_file) else os.path.join(opt.outdir, new_file)
    )
    try:
        meta = retrieve_metadata(original_file)["sd-metadata"]
    except AttributeError:
        try:
            meta = retrieve_metadata(new_file)["sd-metadata"]
        except AttributeError:
            meta = {}

    if "image" not in meta:
        meta = metadata_dumps(opt, seeds=[opt.seed])["image"]
        meta["image"] = {}
    img_data = meta.get("image")
    pp = img_data.get("postprocessing", []) or []
    pp.append(
        {
            "tool": tool,
            "dream_command": command,
        }
    )
    meta["image"]["postprocessing"] = pp
    write_metadata(new_file, meta)


def prepare_image_metadata(
    opt,
    prefix,
    seed,
    operation="generate",
    prior_variations=[],
    postprocessed=False,
    first_seed=None,
):
    if postprocessed and opt.save_original:
        filename = choose_postprocess_name(opt, prefix, seed)
    else:
        wildcards = dict(opt.__dict__)
        wildcards["prefix"] = prefix
        wildcards["seed"] = seed
        try:
            filename = opt.fnformat.format(**wildcards)
        except KeyError as e:
            logger.error(
                f"The filename format contains an unknown key '{e.args[0]}'. Will use {{prefix}}.{{seed}}.png' instead"
            )
            filename = f"{prefix}.{seed}.png"
        except IndexError:
            logger.error(
                "The filename format is broken or complete. Will use '{prefix}.{seed}.png' instead"
            )
            filename = f"{prefix}.{seed}.png"

    if opt.variation_amount > 0:
        first_seed = first_seed or seed
        this_variation = [[seed, opt.variation_amount]]
        opt.with_variations = prior_variations + this_variation
        formatted_dream_prompt = opt.dream_prompt_str(seed=first_seed)
    elif len(prior_variations) > 0:
        formatted_dream_prompt = opt.dream_prompt_str(seed=first_seed)
    elif operation == "postprocess":
        formatted_dream_prompt = "!fix " + opt.dream_prompt_str(
            seed=seed, prompt=opt.input_file_path
        )
    else:
        formatted_dream_prompt = opt.dream_prompt_str(seed=seed)
    return filename, formatted_dream_prompt


def choose_postprocess_name(opt, prefix, seed) -> str:
    match = re.search("postprocess:(\w+)", opt.last_operation)
    if match:
        modifier = match.group(
            1
        )  # will look like "gfpgan", "upscale", "outpaint" or "embiggen"
    else:
        modifier = "postprocessed"

    counter = 0
    filename = None
    available = False
    while not available:
        if counter == 0:
            filename = f"{prefix}.{seed}.{modifier}.png"
        else:
            filename = f"{prefix}.{seed}.{modifier}-{counter:02d}.png"
        available = not os.path.exists(os.path.join(opt.outdir, filename))
        counter += 1
    return filename


def get_next_command(infile=None, model_name="no model") -> str:  # command string
    if infile is None:
        command = input(f"({model_name}) invoke> ").strip()
    else:
        command = infile.readline()
        if not command:
            raise EOFError
        else:
            command = command.strip()
        if len(command) > 0:
            print(f"#{command}")
    return command


def invoke_ai_web_server_loop(gen, gfpgan, codeformer, esrgan):
    print("\n* --web was specified, starting web server...")
    from invokeai.backend.web import InvokeAIWebServer

    # Change working directory to the stable-diffusion directory
    os.chdir(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

    invoke_ai_web_server = InvokeAIWebServer(
        generate=gen, gfpgan=gfpgan, codeformer=codeformer, esrgan=esrgan
    )

    try:
        invoke_ai_web_server.run()
    except KeyboardInterrupt:
        pass


def add_embedding_terms(gen, completer):
    """
    Called after setting the model, updates the autocompleter with
    any terms loaded by the embedding manager.
    """
    trigger_strings = gen.model.textual_inversion_manager.get_all_trigger_strings()
    completer.add_embedding_terms(trigger_strings)


def split_variations(variations_string) -> list:
    # shotgun parsing, woo
    parts = []
    broken = False  # python doesn't have labeled loops...
    for part in variations_string.split(","):
        seed_and_weight = part.split(":")
        if len(seed_and_weight) != 2:
            logger.warning(f'Could not parse with_variation part "{part}"')
            broken = True
            break
        try:
            seed = int(seed_and_weight[0])
            weight = float(seed_and_weight[1])
        except ValueError:
            logger.warning(f'Could not parse with_variation part "{part}"')
            broken = True
            break
        parts.append([seed, weight])
    if broken:
        return None
    elif len(parts) == 0:
        return None
    else:
        return parts


def load_face_restoration(opt):
    try:
        gfpgan, codeformer, esrgan = None, None, None
        if opt.restore or opt.esrgan:
            from invokeai.backend.restoration import Restoration

            restoration = Restoration()
            if opt.restore:
                gfpgan, codeformer = restoration.load_face_restore_models(
                    opt.gfpgan_model_path
                )
            else:
                logger.info("Face restoration disabled")
            if opt.esrgan:
                esrgan = restoration.load_esrgan(opt.esrgan_bg_tile)
            else:
                logger.info("Upscaling disabled")
        else:
            logger.info("Face restoration and upscaling disabled")
    except (ModuleNotFoundError, ImportError):
        print(traceback.format_exc(), file=sys.stderr)
        logger.info("You may need to install the ESRGAN and/or GFPGAN modules")
    return gfpgan, codeformer, esrgan


def make_step_callback(gen, opt, prefix):
    destination = os.path.join(opt.outdir, "intermediates", prefix)
    os.makedirs(destination, exist_ok=True)
    logger.info(f"Intermediate images will be written into {destination}")

    def callback(state: PipelineIntermediateState):
        latents = state.latents
        step = state.step
        if step % opt.save_intermediates == 0 or step == opt.steps - 1:
            filename = os.path.join(destination, f"{step:04}.png")
            image = gen.sample_to_lowres_estimated_image(latents)
            image = image.resize((image.size[0] * 8, image.size[1] * 8))
            image.save(filename, "PNG")

    return callback


def retrieve_dream_command(opt, command, completer):
    """
    Given a full or partial path to a previously-generated image file,
    will retrieve and format the dream command used to generate the image,
    and pop it into the readline buffer (linux, Mac), or print out a comment
    for cut-and-paste (windows)

    Given a wildcard path to a folder with image png files,
    will retrieve and format the dream command used to generate the images,
    and save them to a file commands.txt for further processing
    """
    if len(command) == 0:
        return

    tokens = command.split()
    dir, basename = os.path.split(tokens[0])
    if len(dir) == 0:
        path = os.path.join(opt.outdir, basename)
    else:
        path = tokens[0]

    if len(tokens) > 1:
        return write_commands(opt, path, tokens[1])

    cmd = ""
    try:
        cmd = dream_cmd_from_png(path)
    except OSError:
        logger.error(f"{tokens[0]}: file could not be read")
    except (KeyError, AttributeError, IndexError):
        logger.error(f"{tokens[0]}: file has no metadata")
    except:
        logger.error(f"{tokens[0]}: file could not be processed")
    if len(cmd) > 0:
        completer.set_line(cmd)

def write_commands(opt, file_path: str, outfilepath: str):
    dir, basename = os.path.split(file_path)
    try:
        paths = sorted(list(Path(dir).glob(basename)))
    except ValueError:
        logger.error(f'"{basename}": unacceptable pattern')
        return

    commands = []
    cmd = None
    for path in paths:
        try:
            cmd = dream_cmd_from_png(path)
        except (KeyError, AttributeError, IndexError):
            logger.error(f"{path}: file has no metadata")
        except:
            logger.error(f"{path}: file could not be processed")
        if cmd:
            commands.append(f"# {path}")
            commands.append(cmd)
    if len(commands) > 0:
        dir, basename = os.path.split(outfilepath)
        if len(dir) == 0:
            outfilepath = os.path.join(opt.outdir, basename)
        with open(outfilepath, "w", encoding="utf-8") as f:
            f.write("\n".join(commands))
        logger.info(f"File {outfilepath} with commands created")


def report_model_error(opt: Namespace, e: Exception):
    logger.warning(f'An error occurred while attempting to initialize the model: "{str(e)}"')
    logger.warning(
        "This can be caused by a missing or corrupted models file, and can sometimes be fixed by (re)installing the models."
    )
    yes_to_all = os.environ.get("INVOKE_MODEL_RECONFIGURE")
    if yes_to_all:
        logger.warning(
            "Reconfiguration is being forced by environment variable INVOKE_MODEL_RECONFIGURE"
        )
    else:
        if not click.confirm(
            "Do you want to run invokeai-configure script to select and/or reinstall models?",
            default=False,
        ):
            return

    logger.info("invokeai-configure is launching....\n")

    # Match arguments that were set on the CLI
    # only the arguments accepted by the configuration script are parsed
    root_dir = ["--root", opt.root_dir] if opt.root_dir is not None else []
    config = ["--config", opt.conf] if opt.conf is not None else []
    previous_args = sys.argv
    sys.argv = ["invokeai-configure"]
    sys.argv.extend(root_dir)
    sys.argv.extend(config)
    if yes_to_all is not None:
        for arg in yes_to_all.split():
            sys.argv.append(arg)

    from ..install import invokeai_configure

    invokeai_configure()
    logger.warning("InvokeAI will now restart")
    sys.argv = previous_args
    main()  # would rather do a os.exec(), but doesn't exist?
    sys.exit(0)

if __name__ == "__main__":
    main()
