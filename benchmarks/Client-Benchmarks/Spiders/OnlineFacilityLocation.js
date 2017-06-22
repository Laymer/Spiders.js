Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 31/01/2017.
 */
var spiders = require("../../../src/spiders");
class Point extends spiders.Isolate {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }
    getDistance(p) {
        var xDiff = p.x - this.x;
        var yDiff = p.y - this.y;
        var distance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
        return distance;
    }
}
class Boundary extends spiders.Isolate {
    constructor(x1, x2, y1, y2, Point) {
        super();
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.Point = Point;
    }
    midPoint() {
        var xVal = (this.x1 + this.x2) / 2;
        var yVal = (this.y1 + this.y2) / 2;
        return new this.Point(xVal, yVal);
    }
    contains(point) {
        return this.x1 <= point.x && this.y1 <= point.y && point.x <= this.x2 && point.y <= this.y2;
    }
}
class Quadrant extends spiders.Actor {
    constructor() {
        super();
        this.quadParent = null;
        this.positionToParent = null;
        this.boundary = null;
        this.threshold = null;
        this.depth = null;
        this.initLocalFacilities = null;
        this.initKnownFacilities = null;
        this.initMaxDepthOpenFac = null;
        this.initCustomers = null;
        this.facility = null;
        this.localFacilities = [];
        this.supportCustomers = [];
        this.knownFacilities = null;
        this.maxDepthOpenFac = null;
        this.terminatedChildCount = 0;
        this.childrenFacilities = 0;
        this.facilityCustomers = 0;
        // null when closed, non-null when open
        this.children = null;
        this.childrenBoundaries = null;
        this.childrenSpawned = 0;
        this.totalCost = 0.0;
        this.configed = false;
        this.Point = Point;
        this.Boundary = Boundary;
    }
    makePoint(xVal, yVal) {
        var p = new this.Point(xVal, yVal);
        return p;
    }
    makeBoundary(bx1, by1, bx2, by2) {
        return new this.Boundary(bx1, bx2, by1, by2, this.Point);
    }
    config(parentNull, quadParent, positionToParent, bx1, by1, bx2, by2, threshold, depth, initKnownFacilities, initMaxDepthOpenFac) {
        if (parentNull) {
            this.quadParent = null;
        }
        else {
            this.quadParent = quadParent;
        }
        this.positionToParent = positionToParent;
        this.boundary = this.makeBoundary(bx1, by1, bx2, by2);
        this.threshold = threshold;
        this.depth = depth;
        this.initKnownFacilities = initKnownFacilities;
        this.initMaxDepthOpenFac = initMaxDepthOpenFac;
        this.initLocalFacilities = [];
        this.initCustomers = [];
        this.facility = this.boundary.midPoint();
        this.knownFacilities = this.initKnownFacilities;
        this.maxDepthOpenFac = this.initMaxDepthOpenFac;
        this.configed = true;
    }
    copyInitFacility(xVal, yVal) {
        var facility = this.makePoint(xVal, yVal);
        this.newInitFacility(facility);
    }
    copyInitFacilities(facs) {
        if (this.initLocalFacilities == null) {
            var that = this;
            setTimeout(function () {
                that.copyInitFacilities(facs);
            }, 200);
        }
        else {
            this.initLocalFacilities.concat(facs);
        }
    }
    newInitFacility(facility) {
        if (this.initLocalFacilities == null) {
            var that = this;
            setTimeout(function () {
                that.newInitFacility(facility);
            }, 200);
        }
        else {
            this.initLocalFacilities.push(facility);
        }
    }
    newInitCustomer(customer) {
        if (this.initCustomers == null) {
            var that = this;
            setTimeout(function () {
                that.newInitCustomer(customer);
            }, 200);
        }
        else {
            this.initCustomers.push(customer);
        }
    }
    configDone() {
        //Could be that config isn't done yet (called by other actor for instance)
        if (this.initCustomers == null) {
            var that = this;
            setTimeout(function () {
                that.configDone();
            }, 200);
        }
        else {
            this.parent.actorInit();
            var localFacilities = this.localFacilities;
            this.initLocalFacilities.forEach((localFac) => {
                localFacilities.push(localFac);
            });
            this.localFacilities = localFacilities;
            this.localFacilities.push(this.facility);
            this.initCustomers.forEach((loopPoint) => {
                if (this.boundary.contains(loopPoint)) {
                    this.addCustomer(loopPoint);
                }
            });
        }
    }
    addCustomer(point) {
        this.supportCustomers.push(point);
        var minCost = this.findCost(point);
        this.totalCost += minCost;
    }
    findCost(point) {
        var result = Infinity;
        this.localFacilities.forEach((loopPoint) => {
            var distance = loopPoint.getDistance(point);
            if (distance < result) {
                result = distance;
            }
        });
        return result;
    }
    childSpawned(ref, index, bound) {
        this.childrenSpawned += 1;
        this.localFacilities.forEach((localFac) => {
            ref.copyInitFacility(localFac.x, localFac.y);
        });
        this.supportCustomers.forEach((cust) => {
            ref.newInitCustomer(cust);
        });
        ref.configDone();
        //ref.copyInitFacilities(new this.ArrayIsolate(this.localFacilities))
        //ref.newInitCustomers(new this.ArrayIsolate(customers1))
        this.children[index] = ref;
        this.childrenBoundaries[index] = bound;
    }
    customerMsg(sender, point) {
        var children = this.children;
        if (children == null) {
            this.addCustomer(point);
            if (this.totalCost > this.threshold) {
                this.partition();
            }
        }
        else {
            if ((this.childrenBoundaries.length == 4) && (this.childrenSpawned == 4)) {
                var index = 0;
                var childrenBoundaries = this.childrenBoundaries;
                while (index <= 3) {
                    var loopChildBoundary = childrenBoundaries[index];
                    if (loopChildBoundary.contains(point)) {
                        children[index].customerMsg(this, point);
                        index = 4;
                    }
                    else {
                        index += 1;
                    }
                }
            }
            else {
                var that = this;
                setTimeout(function () {
                    that.customerMsg(sender, point);
                }, 200);
            }
        }
        if (this.quadParent == null) {
            sender.nextCustomerMsg();
        }
    }
    facilityMsg(posToParent, depth, point, bool) {
        this.knownFacilities += 1;
        this.localFacilities.push(point);
        if (bool) {
            this.notifyParentOfFacility(point, depth);
            if (depth > this.maxDepthOpenFac) {
                this.maxDepthOpenFac = depth;
            }
            var childPos = posToParent;
            var sibling = null;
            if (childPos == "TOP_LEFT") {
                sibling = this.children[3];
            }
            else if (childPos == "TOP_RIGHT") {
                sibling = this.children[2];
            }
            else if (childPos == "BOT_RIGHT") {
                sibling = this.children[0];
            }
            else {
                sibling = this.children[1];
            }
            sibling.facilityMsg("UNKNOWN", depth, point, false);
        }
        else {
            var children = this.children;
            if (children != null) {
                children.forEach((child) => {
                    child.facilityMsg("UNKNOWN", depth, point, false);
                });
            }
        }
    }
    notifyParentOfFacility(point, depth) {
        var quadParent = this.quadParent;
        if (quadParent != null) {
            quadParent.facilityMsg(this.positionToParent, depth, point, true);
        }
    }
    partition() {
        this.children = [];
        this.childrenBoundaries = [];
        this.notifyParentOfFacility(this.facility, this.depth);
        this.maxDepthOpenFac = Math.max(this.maxDepthOpenFac, this.depth);
        var thisBoundary = this.boundary;
        var thisFacility = this.facility;
        var thisThreshold = this.threshold;
        var thisDepth = this.depth;
        var thisKnownFac = this.knownFacilities;
        var thisMaxDepth = this.maxDepthOpenFac;
        var firstBoundary = this.makeBoundary(thisBoundary.x1, thisFacility.y, thisFacility.x, thisBoundary.y2);
        var secondBoundary = this.makeBoundary(thisFacility.x, thisFacility.y, thisBoundary.x2, thisBoundary.y2);
        var thirdBoundary = this.makeBoundary(thisBoundary.x1, thisBoundary.y1, thisFacility.x, thisFacility.y);
        var fourthBoundary = this.makeBoundary(thisFacility.x, thisBoundary.y1, thisBoundary.x2, thisFacility.y);
        var customers = [];
        this.supportCustomers.forEach((cust) => {
            customers.push(cust);
        });
        this.parent.spawnQuad(this, "TOP_LEFT", firstBoundary.x1, firstBoundary.y1, firstBoundary.x2, firstBoundary.y2, thisThreshold, thisDepth + 1, thisKnownFac, thisMaxDepth).then((ref) => {
            this.childSpawned(ref, 0, firstBoundary);
        });
        this.parent.spawnQuad(this, "TOP_RIGHT", secondBoundary.x1, secondBoundary.y1, secondBoundary.x2, secondBoundary.y2, thisThreshold, thisDepth + 1, thisKnownFac, thisMaxDepth).then((ref) => {
            this.childSpawned(ref, 1, secondBoundary);
        });
        this.parent.spawnQuad(this, "BOT_LEFT", thirdBoundary.x1, thirdBoundary.y1, thirdBoundary.x2, thirdBoundary.y2, thisThreshold, thisDepth + 1, thisKnownFac, thisMaxDepth).then((ref) => {
            this.childSpawned(ref, 2, thirdBoundary);
        });
        this.parent.spawnQuad(this, "BOT_RIGHT", fourthBoundary.x1, fourthBoundary.y1, fourthBoundary.x2, fourthBoundary.y2, thisThreshold, thisDepth + 1, thisKnownFac, thisMaxDepth).then((ref) => {
            this.childSpawned(ref, 3, fourthBoundary);
        });
        //this.supportCustomers = []
    }
    requestExit() {
        if (this.children != null) {
            this.children.forEach((child) => {
                child.requestExit();
            });
        }
        else {
            this.safelyExit();
        }
    }
    confirmExit() {
        this.terminatedChildCount += 1;
        if (this.terminatedChildCount == 4) {
            this.safelyExit();
        }
    }
    safelyExit() {
        if (this.quadParent != null) {
            var numFacilities = 0;
            if (this.children != null) {
                numFacilities = this.childrenFacilities + 1;
            }
            else {
                numFacilities = this.childrenFacilities;
            }
            var numCustomers = this.facilityCustomers + this.supportCustomers.length;
            this.quadParent.confirmExit();
        }
        else {
            var numFacilities = this.childrenFacilities + 1;
        }
        this.parent.actorExit();
    }
}
class Producer extends spiders.Actor {
    constructor() {
        super();
        this.quadRef = null;
        this.gridSize = null;
        this.numPoints = null;
        this.itemsProduced = 0;
        this.Point = Point;
    }
    makePoint(xVal, yVal) {
        return new this.Point(xVal, yVal);
    }
    getRand(upper, lower) {
        return Math.floor(Math.random() * (upper - lower) + lower);
    }
    config(quadRef, gridSize, numPoints) {
        this.quadRef = quadRef;
        this.gridSize = gridSize;
        this.numPoints = numPoints;
        this.parent.actorInit();
    }
    produceConsumer() {
        var xVal = this.getRand(this.gridSize, 0);
        var yVal = this.getRand(this.gridSize, 0);
        var point = this.makePoint(xVal, yVal);
        this.quadRef.customerMsg(this, point);
        this.itemsProduced += 1;
    }
    nextCustomerMsg() {
        if (this.itemsProduced < this.numPoints) {
            try {
                this.produceConsumer();
            }
            catch (e) {
                console.log("Failed because " + e);
            }
        }
        else {
            try {
                this.quadRef.requestExit();
                this.parent.actorExit();
            }
            catch (e) {
                console.log("Failed becasue: " + e);
            }
        }
    }
}
class OnlineFacilityLocationApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.actorsExited = 0;
        this.totalSpawned = 2;
        this.bench = bench;
    }
    setup() {
        var threshold = benchUtils_1.BenchConfig.facLocAlpha * benchUtils_1.BenchConfig.facLocF;
        var quadRef = this.spawnActor(Quadrant);
        quadRef.config(true, 0, "ROOT", 0, 0, benchUtils_1.BenchConfig.facLocGridSize, benchUtils_1.BenchConfig.facLocGridSize, threshold, 0, 1, -1);
        quadRef.configDone();
        this.prodRef = this.spawnActor(Producer);
        this.prodRef.config(quadRef, benchUtils_1.BenchConfig.facLocGridSize, benchUtils_1.BenchConfig.facLocNumPoints);
    }
    checkConfig() {
        if (this.actorsInitialised == 2) {
            this.prodRef.produceConsumer();
        }
    }
    actorInit() {
        this.actorsInitialised += 1;
        this.checkConfig();
    }
    actorExit() {
        this.actorsExited += 1;
        if (this.actorsExited == this.totalSpawned) {
            this.bench.stopPromise.resolve();
        }
    }
    spawnQuad(parent, positionToParent, bx1, by1, bx2, by2, threshold, depth, initKnownFacilities, initMaxDepthOpenFac) {
        var ref = this.spawnActor(Quadrant);
        var res;
        var rej;
        var prom = new Promise((resolve, reject) => {
            res = resolve;
            rej = reject;
        });
        ref.config(false, parent, positionToParent, bx1, by1, bx2, by2, threshold, depth, initKnownFacilities, initMaxDepthOpenFac).then((_) => {
            res(ref);
        });
        this.totalSpawned += 1;
        return prom;
    }
}
class SpiderOnlineFacilityLocationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Online Facility Location", "Spiders.js Online Facility Location cycle completed", "Spiders.js Online Facility Location completed", "Spiders.js Online Facility Location scheduled");
    }
    runBenchmark() {
        this.onlineFacilityLocationApp = new OnlineFacilityLocationApp(this);
        this.onlineFacilityLocationApp.setup();
    }
    cleanUp() {
        this.onlineFacilityLocationApp.kill();
    }
}
exports.SpiderOnlineFacilityLocationBench = SpiderOnlineFacilityLocationBench;
//# sourceMappingURL=OnlineFacilityLocation.js.map