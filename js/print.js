/*
let mediaQueryList = window.matchMedia('print');
mediaQueryList.addListener(function(mql) {
  if(mql.matches) {
    console.log('webkit equivalent of onbeforeprint');

    const inputs = document.querySelectorAll(".input-field");

    for (let input of inputs) {
        //input.placeholder = input.next.innerText;
        input.innerHTML = "VALUE";
    }
  }
});


window.onbeforeprint = function() {
        console.log('webkit equivalent of onbeforeprint');
    
        const inputs = document.querySelectorAll(".input-field");
    
        for (let input of inputs) {
            //input.placeholder = input.next.innerText;
            input.firstElementChild.placeholder = input.lastElementChild.innerText;
            //input.lastElementChild.style.display = "none";
        }
};*/