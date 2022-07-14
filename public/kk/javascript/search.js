var recipes = document.querySelectorAll(".recipe");
var type = document.querySelectorAll(".type");
var special = document.querySelectorAll(".special");
var all = document.querySelector("#all");
var appetizer = document.querySelector("#appetizer");
var bread = document.querySelector("#bread");
var main = document.querySelector("#main");
var dessert = document.querySelector("#dessert");
var icing = document.querySelector("#icing");
var gluten = document.querySelector("#gluten");
var none = document.querySelector("#none");
var dairy = document.querySelector("#dairy");

function check() {
    if(all.disabled) {
        allRec();
    } else if(appetizer.disabled) {
        hide1("Appetizer");
    } else if(bread.disabled) {
        hide1("Bread");
    } else if(main.disabled) {
        hide1("Main");
    } else if(dessert.disabled) {
        hide1("Dessert");
    } else if(icing.disabled) {
        hide1("Icing");
    };
};

function disabled(b1, b2, b3, b4, b5, b6){ 
    b1.disabled = true;
    b2.disabled = false;
    b3.disabled = false;
    b4.disabled = false;
    b5.disabled = false;
    b6.disabled = false;
}

function disabled2(b1, b2, b3){ 
    b1.disabled = true;
    b2.disabled = false;
    b3.disabled = false;
}

function hide1(type1){
    for(var i = 0; i < recipes.length; i++){
        if(type[i].textContent == type1) {
            recipes[i].classList.remove("hidden");
        } else if(type[i].textContent != type1) {
            recipes[i].classList.add("hidden");
        };
    };
};

function hide2(special1){
    for(var i = 0; i < recipes.length; i++){
        if(recipes[i].classList.contains("hidden")){
            check();
            if(special[i].textContent == special1) {
                recipes[i].classList.remove("hidden");
            } else if(special[i].textContent != special1) {
                recipes[i].classList.add("hidden");
            };
        } else {
            if(special[i].textContent == special1) {
                recipes[i].classList.remove("hidden");
            } else if(special[i].textContent != special1) {
                recipes[i].classList.add("hidden");
            };
        };
    };
};

function allRec() {
    for(var i = 0; i < recipes.length; i++){
        recipes[i].classList.remove("hidden");
    };
};

all.addEventListener("click", function(){
    disabled(all, bread, main, dessert, icing, appetizer);
    allRec();
});

bread.addEventListener("click", function(){
    disabled(bread, main, dessert, icing, appetizer, all);
    hide1("Bread");
});

appetizer.addEventListener("click", function(){
    disabled(appetizer, main, dessert, icing, bread, all);
    hide1("Appetizer");
});

dessert.addEventListener("click", function(){
    disabled(dessert, main, bread, icing, appetizer, all);
    hide1("Dessert");
});

icing.addEventListener("click", function(){
    disabled(icing, bread, main, dessert, appetizer, all);
    hide1("Icing");
});

main.addEventListener("click", function(){
    disabled(main, bread, dessert, icing, appetizer, all);
    hide1("Main");
});