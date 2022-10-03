exports.getDate = function (){
const today = new Date();
const options = { weekday: "long",
                  month: "short",
                  day: "numeric" };
const day = today.toLocaleDateString("en-US", options);
return day;
}

exports.getDay = function (){
const today = new Date();
const options = { weekday: "long" };
const day = today.toLocaleDateString("en-US", options);
return day;
}
