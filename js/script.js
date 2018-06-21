function levenshtein(a, b) {

    a = a.toLowerCase();
    b = b.toLowerCase();

    if(a.length === 0) return b.length;
    if(b.length === 0) return a.length;
  
    var matrix = [];
  
    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }
  
    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }
  
    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                  Math.min(matrix[i][j-1] + 1, // insertion
                                           matrix[i-1][j] + 1)); // deletion
        }
      }
    }
  
    return matrix[b.length][a.length];
}

M.validate_field = function() {
    console.log(this)
}

function updateInputCheck() {

    list = document.querySelectorAll("#answer-list div.input-field");

    for (elem of list) {
        elem.addEventListener("input", (e) => {

            const res = levenshtein(e.target.value, answers[ Number(e.target.id[1]) ])
            console.log(res)
            console.log(e.target.classList)

            if (res < 1) {
                e.target.disabled = true;
            }
    
            
            if (res > 10) {
                e.target.classList.remove('low-distance','medium-distance');
                e.target.classList.add('high-distance');
                console.log(e.target.classList);
            } else if (res > 4) {
                e.target.classList.remove('high-distance','low-distance');
                e.target.classList.add('medium-distance');
                console.log(e.target.classList);
            } else {
                e.target.classList.remove('high-distance','medium-distance');
                e.target.classList.add('low-distance');
                console.log(e.target.classList);
            }
        });
    
        elem.addEventListener("change", e => {
            const res = levenshtein(e.target.value, answers[ Number(e.target.id[1]) ])
            if (res > 3) {
                e.target.value = "";
            } 
        })
    }

}