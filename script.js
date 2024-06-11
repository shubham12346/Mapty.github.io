'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position){
        console.log(`position`,position)
        const {latitude,longitude} = position.coords;
        let url= `https://www.google.com/maps/@${latitude},${longitude}`
        console.log(url)
        const cords = [latitude ,longitude]
        const map = L.map('map').setView(cords, 13);
       

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker(cords).addTo(map)
        .bindPopup('A pretty CSS popup.<br> Easily customizable.')
        .openPopup();

        map.on('click',function(mapEvent){
            console.log("mapEvent",mapEvent)
            const {lat,lng} = mapEvent.latlng;
            L.marker([lat,lng]).addTo(map)
            .bindPopup({
                
            })
        })
      
        } ,function(){
          alert(`Could not get your position `)
    })
}

// https://www.google.com/maps/@18.5580978,73.7699042,14.7z?entry=ttu