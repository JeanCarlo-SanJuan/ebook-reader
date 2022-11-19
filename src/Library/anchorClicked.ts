import {loadMethod, LoadMethod} from "./Load"
import {EnhancedEpub} from "../lib/EnhancedEpub"
import { hide } from "src/layouts/Tab";

export async function anchorClicked(e:MouseEvent) {
    hide()
    if (loadMethod.value == LoadMethod.all)
      return;
    e.preventDefault()
    let l= e.target as HTMLElement||HTMLAnchorElement;
    if (!(l instanceof HTMLAnchorElement))
      return;
    try {
      EnhancedEpub.instance?.between({id:l.href.split("#",2)[1]}); 
    } catch (e) {
      console.log(e);
    }
}