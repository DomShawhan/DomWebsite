var up = document.querySelector("#up");
var down = document.querySelector("#down");
var data = document.querySelectorAll(".data");

function sortUnorderedList(ul, sortDescending) {
    if(typeof ul == "string")
      ul = document.getElementById(ul);

    var lis = document.querySelectorAll(".data");
    var vals = [];

    for(var i = 0, l = lis.length; i < l; i++){
      vals.push(lis[i].innerHTML);
    }
    vals.sort();

    if(sortDescending){
      vals.reverse();
    }
    for(var i = 0, l = lis.length; i < l; i++){
      lis[i].innerHTML = vals[i];
    }
}

sortUnorderedList(".start");

function check() {
    if(down.disabled) {
        sortUnorderedList(".start", 1);
        down.disabled = false;
        up.disabled = true;
    } else {
        sortUnorderedList(".start");
        up.disabled = false;
        down.disabled = true;
    };
};

up.addEventListener("click", check);
down.addEventListener("click", check);