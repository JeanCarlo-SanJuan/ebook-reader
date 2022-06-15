import Epub from "@jcsj/epub"
import { onBookLoaded, setSpeechTarget } from "../components/tts/TTS";
import {Flow, TOC} from "./reactives";
import simplifyHTMLTree from "./simplifyHTMLTree";
import { Bookmarks } from "./Bookmark.js"
import { useTitle } from "@vueuse/core";
/**
 * @param {File} file
 */
export async function loadBookFromFile(file, cached = false) {
    const epub = new Epub(file, simplifyHTMLTree)
    Bookmarks.items.clear()
    Flow.items.clear()
    TOC.items.clear()
    epub.open({
        "parsed-root": async function() {
            this.parseRootFile(this.rootXML)
        },
        "parsed-manifest": function() {
            console.log("Manifest: ", this.manifest);
        },
        "parsed-spine": function() {
            console.log("Spine: ", this.spine);
        },
        "parsed-flow": async function() {
            console.log("Flow: ", this.flow);
            for (const [key, item] of this.flow) {    
                Flow.items.set(
                    key, 
                    await this.getContent(item.id)
                )
            }
            this.emit("loaded-chapters")
        },
        "parsed-toc": function() {
            console.log("TOC: ", this.toc);
            TOC.items = this.toc;
        },
        "parsed-metadata": function() {
            console.log("Meta:", this.metadata);
            useTitle(this.metadata.title)
            Bookmarks.load()
        },
        "loaded-chapters": async function() {

            let notBeenSet = true;
            for (const k of [...Bookmarks.items.keys()].reverse()) {
                const elem = document.querySelector(k)
                elem.classList.add("bookmark")
                if (notBeenSet && setSpeechTarget(elem)) {
                    elem.scrollIntoView({block:"start"});
                    notBeenSet = false;
                }
            }

            if (notBeenSet) {
                onBookLoaded();
            }
        }
    })
}

/**
 * @param {FileSystemFileHandle} handle 
 */
export async function loadBookFromHandle(handle) {
    await loadBookFromFile(
        await handle.getFile()
    )
}

export async function loadBookFromLauncher() {
    if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
        // The File Handling API is supported.
        launchQueue.setConsumer((launchParams) => {
          // Nothing to do when the queue is empty.
          if (!launchParams.files.length) {
              console.log(
                "No files to be launched!"
              );
            return;
          }
          const [handle] = launchParams.files;
          loadBookFromHandle(handle);
        });
    } else {
        console.log("File Handling API is unsupported");
    }
}