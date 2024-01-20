// Function to fetch a random European country
async function getEuropeanCountrys() 
{
    try {
      // Fetch the list of European countries
      const response = await fetch('https://restcountries.com/v3.1/region/europe');

      const turkeyResponse = await fetch('https://restcountries.com/v3.1/alpha/TUR');
      
      // Check if the request was successful
      if (!response.ok || !turkeyResponse.ok) {
        throw new Error('Failed to fetch European countries');
      }

      const europeanCountries = await response.json();

      //add turkey because they think its apart of asia
      const turkey = await turkeyResponse.json();
      europeanCountries.push(turkey[0])
      
      //remove the countries that are too small to fit on the map
      const countriesToRemove = ['Monaco','Andorra','Liechtenstein','Russia','San Marino','Vatican City','Malta','Gibraltar','Isle of Man','Jersey','Åland Islands','Faroe Islands','Guernsey','Svalbard and Jan Mayen']
      const filteredEuropeanCountries = europeanCountries.filter(country => !countriesToRemove.includes(country.name.common));
  
      return filteredEuropeanCountries;
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

//function to display pop up messages
function showMessage(msg,bgCol,anim)
{
  $('.correct-message').remove()
  const correctMessage = document.createElement('div');
  correctMessage.className = 'correct-message';
  correctMessage.textContent = msg;
  correctMessage.style.backgroundColor = bgCol;
  correctMessage.style.animation = 'flash '+ anim +'s ease-in-out';

  // Append the correct message to the body
  document.body.appendChild(correctMessage);

  // Remove the correct message after a delay (e.g., 2 seconds)
  setTimeout(() => {
    document.body.removeChild(correctMessage);
  }, 1000 * anim - 100);
}

//function that choses a random question to ask
function getRandomQuestion(difficultyLevel,categorys)
{
  availiableCategories = categorys[Math.floor(Math.random() * difficultyLevel)]
  category = availiableCategories[Math.floor(Math.random() * availiableCategories.length)]
  return category;
}

//gives all the countrys a random color
function randomColors()
{
  let colors = ['#855C75','#D9AF6B','#e34a33','#AF6458','#736F4C','#526A83','#625377','#68855C','#9C9C5E','#A06177','#8C785D','#467378','#7C7C7C'];
  let count = 0;
  $("path").each(function(){
    $(this).css('fill', colors[count]);
    count ++ 
    if(count >= colors.length)
      count = 0
  })
}

//takes the random category given and displays / formats the question
function categorysToQuestion(europeanCountries,category)
{
  // Get a random index
  const randomIndex = Math.floor(Math.random() * europeanCountries.length);

  // Get the random European country
  const randomEuropeanCountry = europeanCountries[randomIndex];

  console.log(randomEuropeanCountry)

  switch(category)
  {
    case 'name':
      $('.HUD').append('<h2 class="question">Where is ' + randomEuropeanCountry.name.common + '?</h2>')
    break;

    case 'flag':
      $('.HUD').append('<h2 class="question">Where is the country with this flag?</h2> <img class="question" src="'+randomEuropeanCountry.flags.png+'">')
    break;

    case 'neighbors':
      $('.HUD').append('<h2 class="question" >What country has these neighbours</h2>')

      if(randomEuropeanCountry.borders.length > 0)
      {
        for(i of randomEuropeanCountry.borders)
          $('.HUD').append(`<p class="question" >${i}</p>`)
      }
      else
      {
        //two random questions for countries without any neighbours
        if(randomEuropeanCountry.name.common === 'Cyprus')
          $('.HUD').append('<p class="question">This country has no neighbours (HINT: its half turkish, half greek)</p>')
        else
          $('.HUD').append('<p class="question">This country has no neighbours (HINT: they bake bread in the ground)</p>')
      }
    break;

    case 'capital':
      $('.HUD').append(`<h2 class="question">What country has this capital: ${randomEuropeanCountry.capital[0]}</h2>`)
    break
  }
  return randomEuropeanCountry;
}

//refreshes all the UI on the right of the screen
function updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)
{
  $(".HUD").html(`<p>Lives: ${'X'.repeat(lives)}</p><p>Score: ${score}</p><p>Highscore: ${highScore}</p>`)
  category = getRandomQuestion(difficultyLevel,categorys)
  country = categorysToQuestion(europeanCountries,category)
  while(lastCountry == country.name.common)
  {
    $('.question').remove()
    country = categorysToQuestion(europeanCountries,category)
  }
  return country
}

//MAIN FUNCTION
async function setUp()
{
  /* DEFAULT VARIABLES */ 
  let lives = 3;
  let score = 0;
  let highScore = 0;
  let difficultyLevel = 1;
  let lastCountry = '';
  let lost = false;
  categorys = [['name'],['flag'],['neighbors'],['capital']];
  category = ''

  $('.retry').hide()

  randomColors()

  //generate the list of european countries to use for the rest of the session
  europeanCountries = await getEuropeanCountrys();
  
  //Update the UI and generate the first question to ask
  let country = updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)


  //handles all interactions with the countries
  $("path").on('click',function(){
    if(!lost && $('.next').length == 0)
    {
      countryClicked = europeanCountries.find(country => country.name.common === $(this).attr('name'));
      /* CORRECT ANSWER */
      if(countryClicked.name.common === country.name.common)
      {
        score += 1000

        //high score logging
        if(score > highScore)
          highScore = score

        //generate new question
        lastCountry = country.name.common
        country = updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)
        if(score != 5000 && score != 10000 && score != 15000)
          showMessage('Correct!','green',1)
      }
      /* INCORRECT ANSWER */
      else
      {
        lives --
        showMessage('Incorrect!','red',1)

        //Show the actual correct answer
        $('.question').remove()
        $(`path[name="${country.name.common}"]`).addClass('correct-answer')
        $('.HUD').append('The correct country was: '+country.name.common)

        //give the next question if you didn't lose
        if(lives > 0)
        {
          $('.UI').append('<button class="next">Next</button>')
          $('.next').click(function(){
            $('.next').remove()
            console.log(country.name.common)
            $('.correct-answer').removeClass('correct-answer');
            country = updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)
          })
        }
      }

      //handle loss
      if(lives <= 0)
      {
        lost = true
        $('.retry').show()
      }

      //increses difficulty over time
      if(score >= 5000 && difficultyLevel < 2)
      {
        difficultyLevel++
        showMessage('Round 2: + Flags','blue',3.5)
      }
      else if(score >= 10000 && difficultyLevel < 3)
      {
        difficultyLevel++
        showMessage('Round 3: + Neighbours','blue',3.5)
      }
      else if(score >= 15000 && difficultyLevel < 4)
      {
        difficultyLevel++
        showMessage('Round 3: + Capitals','blue',3.5)
      }
    }
  })

  //resets everything
  $(".retry").on('click',function(){
    lives = 3
    score = 0 
    difficultyLevel = 1
    country = updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)
    $('.correct-answer').removeClass('correct-answer');
    lost = false
    $(".retry").hide();
  })
}
  