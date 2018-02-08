import {PubSubTag} from "./SubTag";
import {FarRef,ActorTrait} from "../spiders"
/**
 * Created by flo on 22/03/2017.
 */


export class PSServer extends ActorTrait{
    private subscribers : Map<string,Array<FarRef>>
    private published   : Map<string,Array<any>>

    constructor(myActor){
        super(myActor)
        this.subscribers    = new Map()
        this.published      = new Map()
    }

    addPublish(published,typeTag : PubSubTag){
        if(!this.published.has(typeTag.tagVal)){
            this.published.set(typeTag.tagVal,[])
        }
        this.published.get(typeTag.tagVal).push(published)
        if(this.subscribers.has(typeTag.tagVal)){
            this.subscribers.get(typeTag.tagVal).forEach((subscriber : FarRef)=>{
                subscriber.newPublished(published,typeTag)
            })
        }
    }

    addSubscriber(typeTag : PubSubTag,subReference : FarRef){
        if(!this.subscribers.has(typeTag.tagVal)){
            this.subscribers.set(typeTag.tagVal,[])
        }
        this.subscribers.get(typeTag.tagVal).push(subReference)
        if(this.published.has(typeTag.tagVal)){
            this.published.get(typeTag.tagVal).forEach((publishedObject)=>{
                subReference.newPublished(publishedObject,typeTag)
            })
        }
    }
}