Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
class NodeSuccessiveOverRelaxationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Successive Over Relaxation", "Node Successive Over Relaxation cycle completed", "Node Successive Over Relaxation completed", "Node Successive Over Relaxation scheduled");
        this.lastPort = 8002;
        this.allSpawned = new Map();
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var actorsExited = 0;
        var totalSpawned = 1;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == 1) {
                    that.runnerRef.emit(["boot"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function actorExit() {
                actorsExited += 1;
                if (actorsExited == totalSpawned) {
                    that.stopPromise.resolve();
                }
            }
            function spawnSorActor(pos, value, color, nx, ny, omega, peer, index, indexJ, sorSourcePort) {
                var actRef = that.spawnNode("Successive-Over-Relaxation/SuccessiveOverRelaxationActor", sysHandle, that.lastPort);
                that.allSpawned.set(that.lastPort, actRef);
                actRef.emit(["config", pos, value, color, nx, ny, omega, peer, sorSourcePort]);
                var sorSource = that.allSpawned.get(sorSourcePort);
                sorSource.emit(["sorActorSpawned", pos, index, indexJ, that.lastPort]);
                that.lastPort++;
            }
            function spawnSorPeer(s, partStart, matrix, sorSourcePort) {
                var peerRef = that.spawnNode("Successive-Over-Relaxation/SuccessiveOverRelaxationPeer", sysHandle, that.lastPort);
                that.allSpawned.set(that.lastPort, peerRef);
                peerRef.emit(["config", benchUtils_1.BenchConfig.sorOmega, benchUtils_1.BenchConfig.sorJacobi, s, partStart, matrix, sorSourcePort]);
                var sorSource = that.allSpawned.get(sorSourcePort);
                sorSource.emit(["sorPeerSpawned", that.lastPort]);
                that.lastPort++;
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "actorExit":
                    actorExit();
                    break;
                case "spawnSorActor":
                    spawnSorActor(data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10]);
                    break;
                case "spawnSorPeer":
                    spawnSorPeer(data[1], data[2], data[3], data[4]);
                    break;
                default:
                    console.log("Unknown message (System): " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.runnerRef = that.spawnNode("Successive-Over-Relaxation/SuccessiveOverRelaxationRunner", sysHandle, NodeSuccessiveOverRelaxationBench._RUNNER_PORT_);
        that.runnerRef.emit(["config", benchUtils_1.BenchConfig.sorN, benchUtils_1.BenchConfig.sorDataSizes[benchUtils_1.BenchConfig.sorN], benchUtils_1.BenchConfig.sorOmega, benchUtils_1.BenchConfig.sorJacobi]);
        that.allSpawned.set(NodeSuccessiveOverRelaxationBench._RUNNER_PORT_, that.runnerRef);
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.allSpawned = new Map();
    }
}
NodeSuccessiveOverRelaxationBench._RUNNER_PORT_ = 8001;
exports.NodeSuccessiveOverRelaxationBench = NodeSuccessiveOverRelaxationBench;
//# sourceMappingURL=SuccessiveOverRelaxationMain.js.map