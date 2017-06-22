Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 31/01/2017.
 */
var spiders = require("../../../src/spiders");
class Worker extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.masterRef = null;
        this.id = null;
    }
    config(masterRef, id) {
        this.masterRef = masterRef;
        this.id = id;
        this.parent.actorInit();
    }
    fx(x) {
        var a = Math.sin(Math.pow(x, 3) - 1);
        var b = x + 1;
        var c = a / b;
        var d = Math.sqrt(1 + Math.exp(Math.sqrt(2 * x)));
        var r = c * d;
        return r;
    }
    work(wl, wr, precision) {
        var n = ((wr - wl) / precision);
        var accumArea = 0.0;
        var i = 0;
        while (i < n) {
            var lx = (i * precision) + wl;
            var rx = lx + precision;
            var ly = this.fx(lx);
            var ry = this.fx(rx);
            var area = 0.5 * (ly + ry) * precision;
            accumArea += area;
            i += 1;
        }
        this.masterRef.result(accumArea, this.id);
        this.parent.actorExit();
    }
}
class Master extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.left = null;
        this.right = null;
        this.precision = null;
        this.workers = [];
        this.termsReceived = 0;
        this.resultArea = 0.0;
    }
    config(left, right, precision) {
        this.left = left;
        this.right = right;
        this.precision = precision;
    }
    newWorker(ref) {
        this.workers.push(ref);
    }
    configDone() {
        this.parent.actorInit();
    }
    work() {
        var workerRange = (this.right - this.left) / this.workers.length;
        var index = 0;
        this.workers.forEach((worker) => {
            var wl = (workerRange * index) + this.left;
            var wr = wl + workerRange;
            worker.work(wl, wr, this.precision);
            index += 1;
        });
    }
    result(area, id) {
        this.termsReceived += 1;
        this.resultArea += area;
        if (this.termsReceived == this.workers.length) {
            this.parent.actorExit();
        }
    }
}
class TrapezoidalApproximationApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.actorsExited = 0;
        this.bench = bench;
    }
    setup() {
        this.masterRef = this.spawnActor(Master);
        var precision = (benchUtils_1.BenchConfig.trapezoidRight - benchUtils_1.BenchConfig.trapezoidLeft) / benchUtils_1.BenchConfig.trapezoidPieces;
        this.masterRef.config(benchUtils_1.BenchConfig.trapezoidLeft, benchUtils_1.BenchConfig.trapezoidRight, precision);
        var id = 0;
        for (var i = 0; i < benchUtils_1.BenchConfig.trapezoidWorkers; i++) {
            var workerRef = this.spawnActor(Worker);
            this.masterRef.newWorker(workerRef);
            workerRef.config(this.masterRef, id);
            id += 1;
        }
        this.masterRef.configDone();
    }
    checkConfig() {
        var that = this;
        if (this.actorsInitialised == benchUtils_1.BenchConfig.trapezoidWorkers + 1) {
            this.masterRef.work();
        }
    }
    actorInit() {
        this.actorsInitialised += 1;
        this.checkConfig();
    }
    actorExit() {
        this.actorsExited += 1;
        if (this.actorsExited == (benchUtils_1.BenchConfig.trapezoidWorkers + 1)) {
            this.bench.stopPromise.resolve();
        }
    }
}
class SpiderTrapezoidalApproximationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Trapezoidal Approximation", "Spiders.js Trapezoidal Approximation cycle completed", "Spiders.js Trapezoidal Approximation completed", "Spiders.js Trapezoidal Approximation scheduled");
    }
    runBenchmark() {
        this.trapezoidalApproximationApp = new TrapezoidalApproximationApp(this);
        this.trapezoidalApproximationApp.setup();
    }
    cleanUp() {
        this.trapezoidalApproximationApp.kill();
    }
}
exports.SpiderTrapezoidalApproximationBench = SpiderTrapezoidalApproximationBench;
//# sourceMappingURL=TrapezoidalApproximation.js.map