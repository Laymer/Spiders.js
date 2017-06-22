Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 25/01/2017.
 */
class NatFJCreationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Fork-join creation", "Native Fork-join creation cycle completed", "Native Fork-join creation completed", "Native Fork-join scheduled");
        this.actors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var actorsDone = 0;
        var that = this;
        function sysHandler(event) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.fjCreationActors) {
                    actorsDone = 0;
                    for (var i in that.actors) {
                        that.actors[i].postMessage(["newMessage"]);
                    }
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function actorDone() {
                actorsDone += 1;
                if (actorsDone == benchUtils_1.BenchConfig.fjCreationActors) {
                    that.stopPromise.resolve();
                }
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "actorDone":
                    actorDone();
                    break;
            }
        }
        var count = benchUtils_1.BenchConfig.fjCreationActors;
        while (count > 0) {
            var newActor = this.spawnWorker(require('./FJCreationActor.js'));
            newActor.onmessage = sysHandler;
            this.actors.push(newActor);
            count -= 1;
        }
    }
    cleanUp() {
        this.cleanWorkers(this.actors);
        this.actors = [];
    }
}
exports.NatFJCreationBench = NatFJCreationBench;
//# sourceMappingURL=FJCreationMain.js.map