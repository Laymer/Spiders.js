Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var masterRef = null;
var listRef = null;
var writePercentage = 0;
var sizePercentage = 0;
var totalMsgs = 0;
var currentMsgs = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
function mHandler(data) {
    function linkMaster(masterPort) {
        masterRef = new benchUtils_1.ClientBufferSocket(masterPort, mHandler);
    }
    function linkList(listPort) {
        listRef = new benchUtils_1.ClientBufferSocket(listPort, mHandler);
    }
    function config(wp, sp, ts) {
        writePercentage = wp;
        sizePercentage = sp;
        totalMsgs = ts;
        socketToMain.emit(["actorInit"]);
    }
    function getRandom() {
        return Math.floor(Math.random() * (100 - 0 + 1)) + 0;
    }
    function work() {
        currentMsgs += 1;
        if (currentMsgs <= totalMsgs) {
            var rand = getRandom();
            if (rand < sizePercentage) {
                listRef.emit(["read", myPort]);
            }
            else if (rand < writePercentage) {
                var item = getRandom();
                listRef.emit(["write", item, myPort]);
            }
            else {
                var item = getRandom();
                listRef.emit(["cont", item, myPort]);
            }
        }
        else {
            masterRef.emit(["workerDone"]);
        }
    }
    switch (data[0]) {
        case "linkMaster":
            linkMaster(data[1]);
            break;
        case "linkList":
            linkList(data[1]);
            break;
        case "config":
            config(data[1], data[2], data[3]);
            break;
        case "work":
            work();
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=ConcurrentLinkedListWorker.js.map