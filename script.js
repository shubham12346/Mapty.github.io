 'use strict';

// // prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



class Workout {
    date = new Date();
    id  = (new Date()+'').slice(-10)
    constructor(coords,distance,duration){
        this.coords = coords;
        this.distance = distance;// in km 
        this.duration = duration;// in min 
    }
}

class Running extends Workout{
    type = 'running'
 constructor(coords ,distance,duration ,cadence){
    super(coords,distance,duration);
    this.cadence = cadence;
    this.calcPace();
 }

 calcPace(){
    this.pace = this.duration /this.distance;
    return this.pace;
 }

}
class Cycling extends Workout{
    type = 'cycling'
    constructor(coords ,distance,duration ,elevationGain){
        super(coords,distance,duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
     }

     calcSpeed (){
        this.speed = this.distance/(this.duration/60);
        return this.speed;
     }
   
}

const run = new Running([39,-12],5.2 ,24,178)
const cycling = new Cycling([30,-12],27,95,523);
console.log(run,cycling)

///////////////////////////////////////////
// Application Architecture 
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class App{
    #map ;
    #mapEvent;
    #workout =[];
    constructor(){
    this._getPosition();
    form.addEventListener('submit',this._newWorkout.bind(this));
    inputType.addEventListener('change',this._toggleElevationField);

    }

    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                 this._loadMap.bind(this),function(){
                  alert(`Could not get your position `)
            })
        }
    }

    _loadMap(position){
            const {latitude,longitude} = position.coords;
            const cords = [latitude ,longitude]
            this.#map = L.map('map').setView(cords, 13);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
            this.#map.on('click',this._showForm.bind(this))        
    }
    _showForm(mapE){
        this.#mapEvent = mapE
        console.log("mapEvent",this.#mapEvent)
        const {lat,lng} = this.#mapEvent.latlng;
        form.classList.remove('hidden')
        inputDistance.focus();
    }
    _toggleElevationField (){
        inputElevation.closest('.form_row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList('form__row--hidden');

    }

    _newWorkout(e){
     e.preventDefault();
  
     const validInputs =(...inputs) => inputs.every(inp=> Number.isFinite(inp))

     const allPositive = (...inputs)=> inputs.every(inp=> inp>0);
    // Get data from form 
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const {lat,lng} = this.#mapEvent.latlng;   

    let workout ;
    // If workout running, create running object 
    if(type==='running'){
            // Check if data is valid 
            const cadence = +inputCadence.value;
            if(!validInputs(distance,duration,cadence) || 
              !allPositive(distance,duration,cadence)){
                return alert('Input have to be positive number')
            } 
             workout = new Running([lat,lng],distance,duration,cadence);
        }
    // If workout cycling, create cycling object 
     if(type === 'cycling'){
            const elevation = +inputElevation.value;
            if(!validInputs(distance,duration) || 
            !allPositive(distance,duration)){
                return alert('Input have to be positive number')
            }
            workout = new Cycling([lat,lng],distance,duration,elevation);
          
        }
    // Add new object to workout Array 
this.#workout.push(workout);
console.log(workout)
    // Render workout on map as marker 
   
    //  Render workout on List 
    this.renderWorkoutMarker(workout);
    // hide form and clear input fields 

    inputDistance.value = inputDuration.value =inputCadence.value =inputElevation.value = ''
        // Display Market
       
    }

    renderWorkoutMarker (workout){
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(
           L.popup({
                   autoClose:false,
                   closeOnClick:false,
                   className:`${workout.type}-popup`
               })
           )
           .openPopup()
           .setPopupContent("Workout")
    }

    _renderWorkout (workout){
        const html = `
            <li class="workout workout--running" data-id="1234567890">
          <h2 class="workout__title">Running on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">🏃‍♂️</span>
            <span class="workout__value">5.2</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">24</span>
            <span class="workout__unit">min</span>
          </div>
        `;
    }
}

const app = new App();

