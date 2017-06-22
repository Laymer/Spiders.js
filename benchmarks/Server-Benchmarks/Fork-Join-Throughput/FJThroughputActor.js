Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 07/02/2017.
 */
var totalAmMess = null;
var currentAmMess = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
function mHandler(data) {
    function config(amMess) {
        totalAmMess = amMess;
        currentAmMess = 0;
        socketToMain.emit(["actorInit"]);
    }
    function calc(theta) {
        var sint = Math.sin(theta);
        var res = sint * sint;
    }
    function newMessage(fresh) {
        if (fresh) {
            currentAmMess = 0;
        }
        else {
            currentAmMess += 1;
            calc(37.2);
            if (currentAmMess == totalAmMess) {
                socketToMain.emit(["actorDone"]);
            }
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "newMessage":
            newMessage(data[1]);
            break;
    }
}
//# sourceMappingURL=FJThroughputActor.js.map