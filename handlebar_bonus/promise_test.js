
var p1 = new Promise(function (resolve, reject){
    setTimeout(() => { reject("eka")}, 500);
});

var p2 = new Promise(function (resolve, reject){
    setTimeout(() => { resolve("toka")}, 300);
});

// two ways hot to define error handler: own callback function or try-catch
Promise.all([p1]).
    then(function (data) { console.log("p1 then: " + data) }, function(err) {console.log("err p1:" + err)}).
    catch(function(error){
        console.log("catch p1:" + error)
    });
