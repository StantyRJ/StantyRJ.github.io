
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
  
function findCountry(name,europeanCountries)
{
  return isEuropeanCountry = europeanCountries.find(country => country.name.common === name);
}

function showMessage(msg,bgCol,anim)
{
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

function getRandomQuestion(difficultyLevel,categorys)
{
  availiableCategories = categorys[Math.floor(Math.random() * difficultyLevel)]
  category = availiableCategories[Math.floor(Math.random() * availiableCategories.length)]
  return category;
}

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
      $('.HUD').append("<h2>Where is " + randomEuropeanCountry.name.common + "?</h2>")
    break;

    case 'flag':
      $('.HUD').append('<h2>Where is the country with this flag?</h2> <img src="'+randomEuropeanCountry.flags.png+'">')
    break;

    case 'neighbors':
      $('.HUD').append('<h2>What country has these neighbours</h2>')
      for(i of randomEuropeanCountry.borders)
        $('.HUD').append(`<p>${i}</p>`)

      if(randomEuropeanCountry.borders.length == 0)
      {
        if(randomEuropeanCountry.name.common === 'Cyprus')
          $('.HUD').append('This country has no neighbours (HINT: its half turkish, half greek)')
        else
          $('.HUD').append('This country has no neighbours (HINT: they bake bread in the ground)')
      }
    break;

    case 'capital':
      $('.HUD').append(`<h2>What country has this capital: ${randomEuropeanCountry.capital[0]}</h2>`)
    break
  }
  return randomEuropeanCountry;
}

function updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)
{
  $(".HUD").html(`<p>Lives: ${'X'.repeat(lives)}</p><p>Score: ${score}</p><p>Highscore: ${highScore}</p>`)
  category = getRandomQuestion(difficultyLevel,categorys)
  country = categorysToQuestion(europeanCountries,category)
  while(lastCountry == country.name.common)
    country = categorysToQuestion(europeanCountries,category)
  return country
}

async function setUp()
{
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

  europeanCountries = await getEuropeanCountrys();
  console.log(europeanCountries)
  let country = updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)


  $("path").on('click',function(){
    if(!lost)
    {
      countryClicked = findCountry($(this).attr('name'),europeanCountries)
      if(countryClicked.name.common === country.name.common)
      {
        
        score += 1000
        if(score > highScore)
          highScore = score
        lastCountry = country.name.common
        country = updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)
        if(score != 5000 && score != 10000 && score != 15000)
          showMessage('Correct!','green',.5)
      }
      else
      {
        lives --
        showMessage('Incorrect!','red',.5)
        country = updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)
      }

      if(lives <= 0)
      {
        lost = true
        $('.retry').show()
      }

      if(score >= 5000 && difficultyLevel < 2)
      {
        difficultyLevel++
        showMessage('Round 2: + Flags','blue',2)
      }
      else if(score >= 10000 && difficultyLevel < 3)
      {
        difficultyLevel++
        showMessage('Round 3: + Neighbours','blue',2)
      }
      else if(score >= 15000 && difficultyLevel < 4)
      {
        difficultyLevel++
        showMessage('Round 3: + Capitals','blue',2)
      }
    }
  })

  $(".retry").on('click',function(){
    lives = 3
    score = 0 
    difficultyLevel = 1
    country = updateUI(lives,score,category,categorys,difficultyLevel,highScore,lastCountry)
    lost = false
    $(".retry").hide();
  })
}
  
