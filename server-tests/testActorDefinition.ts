import {Actor} from "../src/spiders"
/**
 * Created by flo on 30/06/2017.
 */
export class TestActor extends Actor{
    getValue() : Promise<number>{
        return 5 as any
    }
}