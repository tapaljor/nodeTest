<<<<<<< HEAD
//main message DOM
let message = document.getElementById("message");
//searching name
let searchName = document.getElementById("searchName");
searchName.addEventListener('keyup', (e) => {
    e.preventDefault();
    let searchValue = searchName.value;

    fetch(`/residents/searchName/${searchValue}`) // this and following lines
        .then(response => response.json()) // act as ajax, without jQuery dependency
        .then(data => { // load data dynamically without loading page
            const searchResult = document.getElementById('searchResult');
            searchResult.innerHTML = '';

            data.forEach(item => {
                const a = document.createElement('a'); // adding an a tag
                a.href = `/residents/${item._id}`;
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

//password comparison
let password1 = document.getElementById("password");
let password2 = document.getElementById("password2");
if (password2) {
    password2.addEventListener("blur", (e) => {
        e.preventDefault();
        if (password1.value !== password2.value) {
            message.textContent = "Password not matching.";
        } else {
            message.textContent = "Password matched.";
        }
    });
}

//checking username availability
let usernameRegister = document.getElementById("usernameWhenRegister");
if (usernameRegister) {
    usernameRegister.addEventListener("change", (e) => {
        e.preventDefault();
        fetch(`/register/searchUsername/${usernameRegister.value}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    message.textContent = "Username unavailable.";
                } else {
                    message.textContent = "Good! Username available.";
                }
            });
    });
}

//parking related
let carBrand = document.getElementById("carBrand");
if (carBrand) {
    carBrand.addEventListener("change", async (e) => {
        e.preventDefault();

        const response = await fetch(`/parkings/carModels/${e.target.value}`);
        carModelResult = await response.json();

        let carModel = document.getElementById("carModel"); //dom is already there, so getting it
        carModel.innerHTML = "";
        for (let a = 0; a < carModelResult[0].models.length; a++) {
            let option = document.createElement('option');
            option.value = carModelResult[0].models[a];
            option.text = carModelResult[0].models[a];
            carModel.appendChild(option);
        }
    });
}
//fetching plate number for auto fill
let plateNumber = document.getElementById("plateNumber");
if (plateNumber) {
    plateNumber.addEventListener("blur", async (e) => {
        e.preventDefault();

        let carBrand = document.getElementById("carBrand");
        let carModel = document.getElementById("carModel");
        let visitorName = document.getElementById("visitorName");

        fetch(`/parkings/checkPlate/${e.target.value}`)
            .then(response => response.json())
            .then(parkingInfo => {
                if (parkingInfo) {
                    carBrand.innerHTML = "";
                    carModel.innerHTML = "";

                    //brandOption
                    let brandOption = document.createElement('option');
                    brandOption.value = parkingInfo["carBrand"];
                    brandOption.textContent = parkingInfo["carBrand"];
                    carBrand.appendChild(brandOption);

                    let modelOption = document.createElement('option');
                    modelOption.value = parkingInfo["carModel"];
                    modelOption.textContent = parkingInfo["carModel"];
                    carModel.appendChild(modelOption);
                    visitorName.value = parkingInfo["visitorName"];
                }
            });
    });
}

//verify unit number
let unitNumber = document.getElementById("unit");
if (unitNumber) {
    unitNumber.addEventListener("change", async (e) => {
        e.preventDefault();
        fetch(`/parcels/verifyUnit/${e.target.value}`)
            .then(response => response.json())
            .then(resident => {
                if (resident) {
                    unitNumber.style.background = 'green';
                } else {
                    unitNumber.style.background = 'red';
                }
                unitNumber.style.color = 'white';
            });
    });
}

let unitWhenRegister = document.getElementById("unitWhenRegister");
if (unitWhenRegister) {
    unitWhenRegister.addEventListener("change", async (e) => {
        e.preventDefault();
        let message = document.getElementById("message");
        fetch(`/parcels/verifyUnit/${e.target.value}`)
            .then(response => response.json())
            .then(resident => {
                if (resident) {
                    message.innerText = 'Already Registered';
                } else {
                    message.innerText = 'Unit Available';
                }
            });
    });
}

//parcel with unit serach
let dynamicParcels = document.getElementById("dynamicParcels");
let openParcelSearch = document.getElementById('openParcelSearch');
if (openParcelSearch) {
    openParcelSearch.addEventListener("keyup", async (e) => {
        e.preventDefault();
        const query = e.target.value.trim(); // Get the input value and trim any extra spaces
        // Only proceed with the fetch if there is a query more than 2 to search
        if (query.length > 2) {
            fetch(`/parcels/searchOpenParcel/${query}`)
                .then(response => response.json())
                .then(parcels => {
                    dynamicParcels.innerHTML = "";
                    for (let parcel of parcels) {
                        let tr = document.createElement('tr');
                        let parcelElements = Array.isArray(parcel) ? parcel : Object.values(parcel);
                        for (let a = 1; a < parcelElements.length; a++) {
                            let td = document.createElement('td');
                            td.textContent = parcelElements[a];
                            tr.appendChild(td);
                        }
                        let tde = document.createElement('td');
                        let ae = document.createElement('a');
                        ae.href = `/parcels/edit/${parcelElements[0]}`;
                        ae.textContent = 'Edit';
                        tde.appendChild(ae);
                        tr.append(tde);
                        let tdd = document.createElement('td');
                        let ad = document.createElement('a');
                        ad.href = `/parcels/issue/${parcelElements[0]}`;
                        ad.textContent = 'Issue';
                        tdd.appendChild(ad);
                        tr.append(tdd);
                        dynamicParcels.appendChild(tr);
                    }
                });
        } else {
            dynamicParcels.innerHTML = "";
        }
    });
}
//closed parcels search
let closedParcelSearch = document.getElementById('closedParcelSearch');
if (closedParcelSearch) {
    closedParcelSearch.addEventListener("keyup", async (e) => {
        e.preventDefault();
        const query = e.target.value.trim(); // Get the input value and trim any extra spaces
        // Only proceed with the fetch if there is a query more than 2 to search
        if (query.length > 2) {
            fetch(`/parcels/searchClosedParcel/${query}`)
                .then(response => response.json())
                .then(parcels => {
                    dynamicParcels.innerHTML = "";
                    for (let parcel of parcels) {
                        let tr = document.createElement('tr');
                        let parcelElements = Array.isArray(parcel) ? parcel : Object.values(parcel);
                        for (let a = 1; a < parcelElements.length; a++) {
                            let td = document.createElement('td');
                            td.textContent = parcelElements[a];
                            tr.appendChild(td);
                        }
                        dynamicParcels.appendChild(tr);
                    }
                });
        } else {
            dynamicParcels.innerHTML = "";
        }
    });
}

//parcel more entry option
let moreEntry = document.getElementById("moreEntry");

if (moreEntry) {
    moreEntry.addEventListener("click", async (e) => {
        let formEntry = document.querySelector('.form-entry');

        // Clone the first form entry
        let clone = formEntry.cloneNode(true);

        // Reset the values of inputs for the new cloned form
        clone.querySelectorAll('input').forEach(input => input.value = '');

        // Ensure only one cloned field is visible at a time without affecting previous clones' values
        let moreEntryField = document.getElementById('moreEntryField');

        // Append the new (reset) clone
        moreEntryField.appendChild(clone);

        // Re-apply event listener for the cloned 'unit' field
        let clonedUnitNumber = clone.querySelector('#unit');
        clonedUnitNumber.style.color = 'black';
        clonedUnitNumber.style.backgroundColor = 'white';
        clonedUnitNumber.addEventListener('change', async (e) => {
            e.preventDefault();
            fetch(`/parcels/verifyUnit/${e.target.value}`)
                .then(response => response.json())
                .then(resident => {
                    if (resident) {
                        clonedUnitNumber.style.backgroundColor = 'green';
                        clonedUnitNumber.style.color = 'white';
                    } else {
                        clonedUnitNumber.style.backgroundColor = 'red';
                        clonedUnitNumber.style.color = 'white';
                    }
                });
        });
    });
}
=======
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
>>>>>>> origin/main
