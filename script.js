 'use strict';


class Workout {
    date = new Date();
    id  = Date.now().toString().slice(-10);
    clicks =0;
    constructor(coords,distance,duration){
        this.coords = coords;
        this.distance = distance;// in km 
        this.duration = duration;// in min 
    }

    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description =`${this.type[0].toUpperCase()} ${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }

    click(){
        this.click++;
    }
}

class Running extends Workout{
    type = 'running'
 constructor(coords ,distance,duration ,cadence){
    super(coords,distance,duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();

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
        this._setDescription();

     }

     calcSpeed (){
        this.speed = this.distance/(this.duration/60);
        return this.speed;
     }
   
}

// const run = new Running([39,-12],5.2 ,24,178)
// const cycling = new Cycling([30,-12],27,95,523);

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
    #mapZoomLevel=13;
    #mapEvent;
    #workout = [];
    constructor(){
    // Get user's location 
    this._getPosition();

    // get data from local store 
    this._getLocalStorage();
    // Attach event handler 
    form.addEventListener('submit',this._newWorkout.bind(this));
    inputType.addEventListener('change',this._toggleElevationField);
    containerWorkouts.addEventListener('click',this.__moveToPopup.bind(this))

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
            this.#map = L.map('map').setView(cords, this.#mapZoomLevel);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
            this.#map.on('click',this._showForm.bind(this))    
            
            this.#workout.forEach(work => {
                this._renderWorkoutMarker(work)
              })
    }
    _showForm(mapE){
        this.#mapEvent = mapE
        console.log("mapEvent",this.#mapEvent)
        form.classList.remove('hidden')
        inputDistance.focus();
    }
    _hideForm(){
        inputDistance.value = inputDuration.value =inputCadence.value =inputElevation.value = ''
        form.style.display =`none`
        form.classList.add('hidden')
        setTimeout(()=> (form.style.display =`grid`),1000)

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
    this._renderWorkoutMarker(workout);

    //  Render workout on List 
    this._renderWorkout(workout)
    // hide form and clear input fields 
    this._hideForm();
    // set local storage 
    this._setLocalStorage();
       
    }

    _renderWorkoutMarker (workout){
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
           .setPopupContent(`${workout.type === 'running'?'🏃‍♂️' :'🚴‍♀️'} ${workout.description}`)
    }

    _renderWorkout (workout){
        let html = `
            <li class="workout workout--running" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.name==='running'?'🏃‍♂️' :'🚴‍♀️'}</span>
            <span class="workout__value">${workout?.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout?.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

        if(workout.type ==='running'){
            html+=` 
            <div class="workout__details">
             <span class="workout__icon">⚡️</span>
             <span class="workout__value">${workout.pace.toFixed(1)}</span>
             <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
        }
        if(workout.type === 'cycling'){
            html+=`
              <div class="workout__details">
               <span class="workout__icon">⚡️</span>
               <span class="workout__value">${workout.speed}</span>
               <span class="workout__unit">km/h</span>
             </div>
             <div class="workout__details">
               <span class="workout__icon">⛰</span>
               <span class="workout__value"> ${workout.elevationGain}</span>
               <span class="workout__unit">m</span>
             </div>
        </li>`
        }

        form.insertAdjacentHTML('afterend',html)

    }
    __moveToPopup(e){
        const workoutEl = e.target.closest('.workout');
        console.log(e,workoutEl)

        if(!workoutEl){
            return ;
        }

        const workout = this.#workout.find(
            work => work.id === workoutEl.dataset.id
        )
        this.#map.setView(workout.coords,this.#mapZoomLevel,{
            animate:true,
            pan :{
                duration:1
            }
        })
        console.log(workout)
        // using the public interface

        workout.click();
    }
    _setLocalStorage(){
      localStorage.setItem('workout',JSON.stringify(this.#workout))
    }

    _getLocalStorage(){
     const data =   JSON.parse(localStorage.getItem('workout'));
     console.log("data",data)
     if(!data) return ;

     this.#workout = data;
     // render the previous workouts 

     this.#workout.forEach(work => {
        this._renderWorkout(work) ;
      })
    }

    reset(){
        localStorage.removeItem('workout');
        location.reload();
    }
}

const app = new App();
console.log("app",app)

