Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 18/01/2017.
 */
var spider = require("../src/spiders");
/**
 * Created by flo on 10/01/2017.
 */
var scheduled = [];
class testApp extends spider.Application {
    constructor() {
        super();
        this.mainValue = 10;
        this.field = 10;
    }
    mainMethod() {
        return 10;
    }
    getGUI() {
        return window.guiField;
    }
}
var app = new testApp();
function log(testName, result, expected) {
    var ul = document.getElementById("resultList");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(testName + ". Expected: " + expected + " . Result : " + result));
    li.setAttribute("id", "element4"); // added line
    if (result == expected) {
        li.style.color = "Green";
    }
    else {
        li.style.color = "Red";
    }
    ul.appendChild(li);
}
class ROAMirror extends spider.SpiderActorMirror {
    constructor() {
        super();
        this.testValue = 5;
    }
}
class ROAActor extends spider.Actor {
    constructor() {
        super(new ROAMirror());
    }
    test() {
        return this.reflectOnActor().testValue;
    }
}
let performROA = () => {
    let act = app.spawnActor(ROAActor);
    return act.test().then((v) => {
        log("Reflecting On Actor", v, 5);
    });
};
scheduled.push(performROA);
class InitMirror extends spider.SpiderActorMirror {
    initialise(appActor, parentRef) {
        super.initialise(appActor, parentRef);
        this.testValue = 5;
    }
}
class InitActor extends spider.Actor {
    constructor() {
        super(new InitMirror());
    }
    init() {
        this.testValue = 5;
    }
    test() {
        return this.reflectOnActor().testValue + this.testValue;
    }
}
let customInit = () => {
    let act = app.spawnActor(InitActor);
    return act.test().then((v) => {
        log("Custom Init (MAP)", v, 10);
    });
};
scheduled.push(customInit);
class CustInvocMAPMirror extends spider.SpiderActorMirror {
    receiveInvocation(sender, target, methodName, args, perform) {
        this.testValue = 5;
        super.receiveInvocation(sender, target, methodName, args, perform);
    }
}
class CustInvocMAPActor extends spider.Actor {
    constructor() {
        super(new CustInvocMAPMirror());
    }
    test() {
        this.testValue = 5;
        return this.reflectOnActor().testValue + this.testValue;
    }
}
let customInvocMap = () => {
    let act = app.spawnActor(CustInvocMAPActor);
    return act.test().then((v) => {
        log("Custom Invocation (MAP)", v, 10);
    });
};
scheduled.push(customInvocMap);
class custAccessMapMirror extends spider.SpiderActorMirror {
    receiveAccess(sender, target, fieldName, perform) {
        target[fieldName] += 5;
        super.receiveAccess(sender, target, fieldName, perform);
    }
}
class custAccessMapActor extends spider.Actor {
    constructor() {
        super(new custAccessMapMirror());
        this.testValue = 5;
    }
}
let customAccessMap = () => {
    let act = app.spawnActor(custAccessMapActor);
    return act.testValue.then((v) => {
        log("Custom Access (MAP)", v, 10);
    });
};
scheduled.push(customAccessMap);
class CustSendInvocMapMirror extends spider.SpiderActorMirror {
    sendInvocation(target, methodName, args, contactId = this.base.thisRef.ownerId, contactAddress = null, contactPort = null, mainId = null) {
        this.testValue = 5;
        return super.sendInvocation(target, methodName, args, contactId, contactAddress, contactPort, mainId);
    }
}
class CustSendInvocMapApp extends spider.Application {
    testP() {
        return 5;
    }
}
class CustSendInvocMapActor extends spider.Actor {
    constructor() {
        super(new CustSendInvocMapMirror());
    }
    test() {
        return this.parent.testP().then((v) => {
            return this.reflectOnActor().testValue + v;
        });
    }
}
let custSendInvocMAP = () => {
    let custSendInvocMapAPP = new CustSendInvocMapApp();
    let act = custSendInvocMapAPP.spawnActor(CustSendInvocMapActor);
    return act.test().then((v) => {
        log("Custom Send Invocation (MAP)", v, 10);
    });
};
scheduled.push(custSendInvocMAP);
class CustSendAccessMapMirror extends spider.SpiderActorMirror {
    sendAccess(target, fieldName, contactId = this.base.thisRef.ownerId, contactAddress = null, contactPort = null, mainId = null) {
        this.testValue = 5;
        return super.sendAccess(target, fieldName, contactId, contactAddress, contactPort, mainId);
    }
}
class CustSendAccessMAPApp extends spider.Application {
    constructor() {
        super();
        this.testValue = 5;
    }
}
class CustSendAccessMapActor extends spider.Actor {
    constructor() {
        super(new CustSendAccessMapMirror());
    }
    test() {
        return this.parent.testValue.then((v) => {
            return this.reflectOnActor().testValue + v;
        });
    }
}
let custSendAccessMap = () => {
    let custSendAccessMapApp = new CustSendAccessMAPApp();
    let act = custSendAccessMapApp.spawnActor(CustSendAccessMapActor);
    return act.test().then((v) => {
        log("Custom Send Access (MAP)", v, 10);
    });
};
scheduled.push(custSendAccessMap);
class ROOMirror extends spider.SpiderObjectMirror {
    constructor() {
        super();
        this.testValue = 5;
    }
}
class ROOObject extends spider.SpiderObject {
    constructor(mirrorClass) {
        super(new mirrorClass());
    }
}
class ROOActor extends spider.Actor {
    constructor() {
        super();
        this.TestObject = ROOObject;
        this.TestMirror = ROOMirror;
    }
    test() {
        let o = new this.TestObject(this.TestMirror);
        return this.reflectOnObject(o).testValue;
    }
}
let ROO = () => {
    let act = app.spawnActor(ROOActor);
    return act.test().then((v) => {
        log("Reflect On Object", v, 5);
    });
};
scheduled.push(ROO);
class CustInvokeMOPMirror extends spider.SpiderObjectMirror {
    invoke(methodName, args) {
        this.testValue = 5;
        return super.invoke(methodName, args);
    }
}
class CustInvokeMOPObject extends spider.SpiderObject {
    constructor(mirrorClass) {
        super(new mirrorClass());
    }
    someMethod() {
        return 5;
    }
}
class CustInvokeMOPActor extends spider.Actor {
    constructor() {
        super();
        this.TestObject = CustInvokeMOPObject;
        this.TestMirror = CustInvokeMOPMirror;
    }
    test() {
        let o = new this.TestObject(this.TestMirror);
        let r = o.someMethod();
        return this.reflectOnObject(o).testValue + r;
    }
}
let customInvocMOP = () => {
    let act = app.spawnActor(CustInvokeMOPActor);
    return act.test().then((v) => {
        log("Custom Invoke (MOP)", v, 10);
    });
};
scheduled.push(customInvocMOP);
class CustomAccessMopMirror extends spider.SpiderObjectMirror {
    access(fieldName) {
        this.testValue = 5;
        return super.access(fieldName);
    }
}
class CustomAccessMopObject extends spider.SpiderObject {
    constructor(mirrorClass) {
        super(new mirrorClass());
        this.someField = 5;
    }
}
class CustomAccessMopActor extends spider.Actor {
    constructor() {
        super();
        this.TestObject = CustomAccessMopObject;
        this.TestMirror = CustomAccessMopMirror;
    }
    test() {
        let o = new this.TestObject(this.TestMirror);
        let r = o.someField;
        return this.reflectOnObject(o).testValue + r;
    }
}
let CustomAccessMop = () => {
    let act = app.spawnActor(CustomAccessMopActor);
    return act.test().then((v) => {
        log("Custom Access (MOP)", v, 10);
    });
};
scheduled.push(CustomAccessMop);
class custWriteMOPMirror extends spider.SpiderObjectMirror {
    write(fieldName, value) {
        this.testValue = 5;
        this.base[fieldName] = value * 2;
        return true;
    }
}
class CustomWriteMOPObject extends spider.SpiderObject {
    constructor(mirrorClass) {
        super(new mirrorClass());
        this.someField = 5;
    }
}
class CustomWriteMOPActor extends spider.Actor {
    constructor() {
        super();
        this.TestObject = CustomWriteMOPObject;
        this.TestMirror = custWriteMOPMirror;
    }
    test() {
        let o = new this.TestObject(this.TestMirror);
        let r = o.someField;
        return this.reflectOnObject(o).testValue + r;
    }
}
let CustomWriteMop = () => {
    let act = app.spawnActor(CustomWriteMOPActor);
    return act.test().then((v) => {
        log("Custom Write (MOP)", v, 15);
    });
};
scheduled.push(CustomWriteMop);
class CustomPassMopMirror extends spider.SpiderIsolateMirror {
    pass() {
        this.testValue = 5;
        return super.pass();
    }
}
class CustomPassMopObject extends spider.SpiderIsolate {
    constructor(mirrorClass) {
        super(new mirrorClass());
    }
}
class CustomPassMopActor extends spider.Actor {
    constructor() {
        super();
        this.o = new CustomPassMopObject(CustomPassMopMirror);
    }
    test() {
        return this.reflectOnObject(this.o).testValue;
    }
}
let CustomPassMop = () => {
    let act = app.spawnActor(CustomPassMopActor);
    return act.test().then((v) => {
        log("Custom Pass (MOP)", v, 5);
    });
};
scheduled.push(CustomPassMop);
class CustomResolveMopMirror extends spider.SpiderIsolateMirror {
    resolve() {
        this.testValue = 5;
    }
}
class CustomResolveMopObject extends spider.SpiderIsolate {
    constructor(mirrorClass) {
        super(new mirrorClass());
    }
}
class CustomResolveMopActor extends spider.Actor {
    constructor() {
        super();
        this.o = new CustomResolveMopObject(CustomResolveMopMirror);
    }
    test() {
        return this.reflectOnObject(this.o).testValue;
    }
}
let CustomResolveMop = () => {
    let act = app.spawnActor(CustomResolveMopActor);
    return act.test().then((v) => {
        log("Custom Resolve (MOP)", v, 5);
    });
};
scheduled.push(CustomResolveMop);
class testFieldSerActor extends spider.Actor {
    constructor() {
        super();
        this.val = 10;
    }
}
var performFieldSer = () => {
    var fieldActor = app.spawnActor(testFieldSerActor);
    return fieldActor.val.then((v) => {
        log("Field Serialisation", v, 10);
        app.kill();
    });
};
scheduled.push(performFieldSer);
class testMethSerActor extends spider.Actor {
    msub() {
        return 5;
    }
    m() {
        return this.msub() + 5;
    }
}
var performMethSer = () => {
    var methActor = app.spawnActor(testMethSerActor);
    return methActor.m().then((v) => {
        log("Method Serialisaton", v, 10);
        app.kill();
    });
};
scheduled.push(performMethSer);
var aValue = 5;
class testConSerActor extends spider.Actor {
    constructor() {
        super();
        this.val = aValue;
    }
    test() {
        return this.val;
    }
}
var performConSer = () => {
    var actor = app.spawnActor(testConSerActor);
    return actor.test().then((v) => {
        log("Construction", v, aValue);
        app.kill();
    });
};
scheduled.push(performConSer);
class testInitSerActor extends spider.Actor {
    constructor() {
        super();
        this.val = 10;
    }
    init() {
        this.val += 5;
    }
}
var peformInitSer = () => {
    var actor = app.spawnActor(testInitSerActor);
    return actor.val.then((v) => {
        log("Initialisation", v, 15);
        app.kill();
    });
};
scheduled.push(peformInitSer);
class testScopeActor extends spider.Actor {
    get() {
        return this.promisePool;
    }
}
var performScopeSer = () => {
    var actor = app.spawnActor(testScopeActor);
    return actor.get().then((v) => {
        log("Scope", v, undefined);
        app.kill();
    });
};
scheduled.push(performScopeSer);
class baseMethodInhActor extends spider.Actor {
    test() {
        return 5;
    }
}
class inhActor extends baseMethodInhActor {
    testInh() {
        return this.test();
    }
}
var performMethodInhSer = () => {
    var actor = app.spawnActor(inhActor);
    return actor.testInh().then((v) => {
        log("Inheritance (Method)", v, 5);
        app.kill();
    });
};
scheduled.push(performMethodInhSer);
class baseFieldInhActor extends spider.Actor {
    constructor() {
        super();
        this.baseField = 5;
    }
}
class fieldInhActor extends baseFieldInhActor {
}
var performFieldInhSer = () => {
    var actor = app.spawnActor(fieldInhActor);
    return actor.baseField.then((v) => {
        log("Inheritance (Field)", v, 5);
        app.kill();
    });
};
scheduled.push(performFieldInhSer);
//Due to Browserify's static analyser it is impossible to dynamically require a module. therefore require must happen on actor creation time (the required library is available to the actor is a far reference)
//Warning, this entails that all work done by the required librarby is performed on the spawning thread (use importscripts if needed to require in actor self)
class testReqActor extends spider.Actor {
    constructor() {
        super();
        this.mod = require('/Users/flo/WebstormProjects/Spiders.js/client-tests/clientTestModule');
    }
    invoke() {
        return this.mod.testFunction();
    }
}
var performReq = () => {
    var actor = app.spawnActor(testReqActor);
    return actor.invoke().then((v) => {
        log("Require", v, 5);
        app.kill();
    });
};
scheduled.push(performReq);
class testFieldAccessActor extends spider.Actor {
    constructor() {
        super();
        this.value = 10;
    }
}
var performFieldAccess = () => {
    var actor = app.spawnActor(testFieldAccessActor);
    return actor.value.then((value) => {
        log("Accessing actor instance variable", value, 10);
        app.kill();
    });
};
scheduled.push(performFieldAccess);
class testMethodInvocActor extends spider.Actor {
    m() {
        return 10;
    }
}
var performMethodInvoc = () => {
    var actor = app.spawnActor(testMethodInvocActor);
    return actor.m().then((retVal) => {
        log("Invoking method on far reference", retVal, 10);
        app.kill();
    });
};
scheduled.push(performMethodInvoc);
class testParentAccessActor extends spider.Actor {
    access() {
        return this.parent.mainValue;
    }
}
var performParentAccess = () => {
    var actor = app.spawnActor(testParentAccessActor);
    return actor.access().then((v) => {
        log("Actor accessing main instance variable", v, 10);
        app.kill();
    });
};
scheduled.push(performParentAccess);
class testParentInvokeActor extends spider.Actor {
    invoke() {
        return this.parent.mainMethod();
    }
}
var performParentInvoke = () => {
    var actor = app.spawnActor(testParentInvokeActor);
    return actor.invoke().then((v) => {
        log("Actor invoking main method", v, 10);
        app.kill();
    });
};
scheduled.push(performParentInvoke);
class testPromiseRejectActor extends spider.Actor {
    m() {
        throw new Error("This is an error");
    }
}
var performPromiseReject = () => {
    var actor = app.spawnActor(testPromiseRejectActor);
    return actor.m().catch((reason) => {
        log("Promise rejection handling (method invocation)", reason.message, "This is an error");
        app.kill();
    });
};
scheduled.push(performPromiseReject);
class testPromisePipeActor extends spider.Actor {
    get() {
        return this.parent.field;
    }
}
var performPromisePipe = () => {
    var actor = app.spawnActor(testPromisePipeActor);
    return actor.get().then((val) => {
        log("Promise pipelining (field access)", val, 10);
        app.kill();
    });
};
scheduled.push(performPromisePipe);
class testPromiseInvocPipeActor extends spider.Actor {
    get() {
        return this.parent.mainMethod();
    }
}
var performPromiseInvocPipe = () => {
    var actor = app.spawnActor(testPromiseInvocPipeActor);
    return actor.get().then((val) => {
        log("Promise pipelining (method invocation)", val, 10);
        app.kill();
    });
};
scheduled.push(performPromiseInvocPipe);
class mIsolate extends spider.SpiderIsolate {
    constructor() {
        super();
        this.field = 6;
    }
    m() {
        return 5;
    }
}
class testIsolateActor extends spider.Actor {
    constructor() {
        super();
        this.mIsolate = mIsolate;
    }
    getIsolate() {
        return new this.mIsolate();
    }
}
var performIsolate = () => {
    var actor = app.spawnActor(testIsolateActor);
    return actor.getIsolate().then((isol) => {
        log("Isolate passing", isol.field, 6);
        log("Isolate passing2", isol.m(), 5);
        app.kill();
    });
};
scheduled.push(performIsolate);
class innerIsolate extends spider.SpiderIsolate {
    constructor() {
        super();
        this.innerField = 5;
    }
}
class outerIsolate extends spider.SpiderIsolate {
    constructor() {
        super();
        this.outerField = 6;
        this.innerIsol = new innerIsolate();
    }
    getOuterField() {
        return this.outerField;
    }
    getInnerIsolate() {
        return this.innerIsol;
    }
}
var app = new testApp();
class testNestedIsolateActor extends spider.Actor {
    constructor() {
        super();
        this.mIsolate = new outerIsolate();
    }
    getIsolate() {
        return this.mIsolate;
    }
}
var performNestedIsolate = () => {
    var actor = app.spawnActor(testNestedIsolateActor);
    return actor.getIsolate().then((isol) => {
        log("Nested Isolate passing", isol.getOuterField(), 6);
        log("Nested Isolate passing2", isol.getInnerIsolate().innerField, 5);
        app.kill();
    });
};
scheduled.push(performNestedIsolate);
class testNumSerActor extends spider.Actor {
    compute(num) {
        return num + 5;
    }
}
var performNumSer = () => {
    var actor = app.spawnActor(testNumSerActor);
    return actor.compute(5).then((val) => {
        log("Correct serialisation of numeric values", val, 10);
        app.kill();
    });
};
scheduled.push(performNumSer);
class testStringSerActor extends spider.Actor {
    append(str) {
        return str + 5;
    }
}
var performStringSer = () => {
    var actor = app.spawnActor(testStringSerActor);
    return actor.append("5").then((val) => {
        log("Correct serialisation of string values", val, 55);
        app.kill();
    });
};
scheduled.push(performStringSer);
class testBoolSerActor extends spider.Actor {
    test(bool) {
        if (bool) {
            return "ok";
        }
        else {
            return "nok";
        }
    }
}
var performBoolSer = () => {
    var actor = app.spawnActor(testBoolSerActor);
    return actor.test(false).then((val) => {
        log("Correct serialisation of boolean values", val, "nok");
        app.kill();
    });
};
scheduled.push(performBoolSer);
class testUserPromActor extends spider.Actor {
    async() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(5);
            }, 200);
        });
    }
}
var performUserProm = () => {
    var actor = app.spawnActor(testUserPromActor);
    return actor.async().then((val) => {
        log("User-level promise serialisation", val, 5);
        app.kill();
    });
};
scheduled.push(performUserProm);
class TestMapActor extends spider.Actor {
    constructor() {
        super();
        this.m = new Map();
        this.m.set("native", 5);
        this.m.set("object", { x: 5 });
    }
    test() {
        let nat = this.m.get("native");
        return this.m.get("object").x.then((xVal) => {
            return xVal + nat;
        });
    }
}
let performMap = () => {
    let act = app.spawnActor(TestMapActor);
    return act.test().then((v) => {
        log("Map serialisation", v, 10);
        app.kill();
    });
};
scheduled.push(performMap);
class testArgSerActor extends spider.Actor {
    m(num, str, bool) {
        return [num, str, bool];
    }
}
var performArgSer = () => {
    var actor = app.spawnActor(testArgSerActor);
    return actor.m(1, "1", true).then((retArr) => {
        log("Method argument serialisation", retArr[0], 1);
        log("Method argument serialisation", retArr[1], "1");
        log("Method argument serialisation", retArr[2], true);
        app.kill();
    });
};
scheduled.push(performArgSer);
var ob = {
    field: 5
};
class testLexObActor extends spider.Actor {
    constructor() {
        super();
        this.farRef = ob;
    }
    test() {
        return this.farRef.field;
    }
}
var performLexOb = () => {
    var actor = app.spawnActor(testLexObActor);
    return actor.test().then((v) => {
        log("Lexical object serialisation during construction", v, ob.field);
        app.kill();
    });
};
scheduled.push(performLexOb);
class testFarRefActor1 extends spider.Actor {
    constructor() {
        super();
        this.value = 666;
    }
}
class testFarRefActor2 extends spider.Actor {
    obtainAndAccess(farRef) {
        return farRef.value;
    }
}
var performFarRef = () => {
    var actor1 = app.spawnActor(testFarRefActor1);
    var actor2 = app.spawnActor(testFarRefActor2);
    return actor2.obtainAndAccess(actor1).then((v) => {
        log("Far ref serialisation", v, 666);
        app.kill();
    });
};
scheduled.push(performFarRef);
class testGUIActor extends spider.Actor {
    getField() {
        return this.parent.getGUI();
    }
}
var performGUI = () => {
    var actor = app.spawnActor(testGUIActor);
    return actor.getField().then((v) => {
        log("GUI", v, "guiField");
        app.kill();
    });
};
scheduled.push(performGUI);
class testReferencePassing_ReferencedActor extends spider.Actor {
    setValue(x) { this.x = x; }
    getValue() { return this.x; }
}
class testReferencePassing_ReferencingActor extends spider.Actor {
    constructor(ref) {
        super();
        this.actorreference = ref;
    }
    init() {
        this.actorreference.setValue(0);
    }
    getValue() { return this.actorreference.getValue(); }
}
var performActorReferencePassingTest = () => {
    var actor1 = app.spawnActor(testReferencePassing_ReferencedActor);
    var actor2 = app.spawnActor(testReferencePassing_ReferencingActor, [actor1], 8081);
    return actor2.getValue().then((v) => {
        log("Actor reference passing and referencing in init", v, 0);
        app.kill();
    });
};
scheduled.push(performActorReferencePassingTest);
let someVar = 5;
class TestScopeIsolate extends spider.SpiderIsolate {
    constructor() {
        super();
        this.val = someVar;
    }
}
class TestScopeActor extends spider.Actor {
    constructor() {
        super();
        let scope = new spider.LexScope();
        scope.addElement("someVar", someVar);
        spider.bundleScope(TestScopeIsolate, scope);
        this.TestIsolate = TestScopeIsolate;
    }
    test() {
        let isol = new this.TestIsolate();
        return isol.val;
    }
}
var performScopeBunlde = () => {
    return app.spawnActor(TestScopeActor).test().then((v) => {
        log("Scope Bundling", v, someVar);
    });
};
scheduled.push(performScopeBunlde);
class SuperInitActor extends spider.Actor {
    constructor() {
        super();
        this.val = 10;
    }
    init() {
        this.val += 5;
    }
}
class BaseInitActor extends SuperInitActor {
    init() {
        this.val = this.val * 2;
    }
}
var performInitChaining = () => {
    var a = app.spawnActor(BaseInitActor);
    return a.val.then((v) => {
        log("Init chaining", v, 30);
    });
};
scheduled.push(performInitChaining);
/*class StaticActor extends spider.Actor{
    static _STATIC_FIELD = 5
    static _STATIC_METHOD_(){
        return 6
    }
    getField(){
        return StaticActor._STATIC_FIELD
    }
    getMethod(){
        return StaticActor._STATIC_METHOD_()
    }
}
var performStaticFieldAndMethod = () =>{
    var a = app.spawnActor(StaticActor)
    return a.getField().then((v)=>{
        log("Static Field access : " + (v == 5))
        return a.getMethod().then((vv)=>{
            log("Static Method access: " + (vv == 6))
        })
    })
}
scheduled.push(performStaticFieldAndMethod)

class StaticSuperActor extends spider.Actor{
    static _STATIC_SUPER_FIELD = 5
}
class StaticBaseActor extends StaticSuperActor{
    getField(){
        return StaticSuperActor._STATIC_SUPER_FIELD
    }
}

var performStaticInheritance = () =>{
    var a = app.spawnActor(StaticBaseActor)
    return a.getField().then((v)=>{
        log("Static inheritance : " + (v == 5))
    })
}
scheduled.push(performStaticInheritance)

class StaticEror extends spider.Actor{
    static _STATIC_FIELD_ = 5
    changeField(){
        return StaticEror._STATIC_FIELD_ = 6
    }
}

var performStaticError = () =>{
    var a = app.spawnActor(StaticEror)
    return a.changeField().catch((e)=>{
        log("Static mutation : " + true)
    })
}
scheduled.push(performStaticError)*/
function performAll(nextTest) {
    nextTest().then(() => {
        if (scheduled.length > 0) {
            performAll(scheduled.pop());
        }
    });
}
performAll(scheduled.pop());
//# sourceMappingURL=testBaseFramework.js.map