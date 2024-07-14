let searchName = document.getElementById("searchName");

searchName.addEventListener('keyup', (e) => {
    e.preventDefault();
    let searchValue = searchName.value;

    fetch(`/searchName?q=${searchValue}`) // this and following lines
        .then(response => response.json()) // act as ajax, without jQuery dependency
        .then(data => { // load data dynamically without loading page
            const searchResult = document.getElementById('searchResult');
            searchResult.innerHTML = '';

            data.forEach(item => {
                const a = document.createElement('a'); // adding an a tag
                a.href = `/displayOne?id=${item._id}`;
                a.innerText = `${item.unit} ${item.name}`;
                searchResult.appendChild(a);
            });
            if (data.length > 0) {
                searchResult.classList.add('visible'); // Show the search results if there are any
            } else {
                searchResult.classList.remove('visible'); // Hide if no results
            }
        });
});
