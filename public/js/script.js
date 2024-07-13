let searchName = document.getElementById("searchName");
searchName.addEventListener('keyup', (e) => {
    e.preventDefault();
    let searchValue = searchName.value;
    fetch(`/searchName?q=${searchValue}`) //this and following lines
        .then( response => response.json()) //act as ajax, wthout JQuery dependency
        .then( data => {                   //load data dynamiclaly without loading page
            const searchResults = document.getElementById('searchResult');
            searchResult.innerHTML = '';
            data.forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a'); //adding a a tag
                a.href = `/displayOne?id=${item._id}`;
                a.textContent = item.name + " " + item.phoneNumber;
                li.appendChild(a);
                searchResult.appendChild(li);
            });
        });
});