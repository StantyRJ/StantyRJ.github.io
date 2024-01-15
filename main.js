
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



function getRandomQuestion(difficultyLevel,categorys)
{
  availiableCategories = categorys[Math.floor(Math.random() * difficultyLevel)]
  category = availiableCategories[Math.floor(Math.random() * availiableCategories.length)]
  return category;
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
      $('.HUD').append("<p>Where is " + randomEuropeanCountry.name.common + "?")
    break;

    case 'flag':
      console.log(randomEuropeanCountry.flags.png)
      $('.HUD').append('<p>Where is the country with this flag?</p> <img src="'+randomEuropeanCountry.flags.png+'">')
    break;
  }
  return randomEuropeanCountry;
}

function updateUI(lives,score,category,categorys,difficultyLevel,highScore)
{
  $(".HUD").html(`<p>Lives: ${'X'.repeat(lives)}</p><p>Score: ${score}</p><p>Highscore: ${highScore}</p>`)
  category = getRandomQuestion(difficultyLevel,categorys)
  country = categorysToQuestion(europeanCountries,category)
  return country
}

async function setUp()
{
  let lives = 3;
  let score = 0;
  let highScore = 0;
  let difficultyLevel = 1;
  let lost = false
  categorys = [['name'],['flag'],['neighbors'],['population','area']];
  category = ''
  $('.retry').hide()
  europeanCountries = await getEuropeanCountrys();
  console.log(europeanCountries)
  let country = updateUI(lives,score,category,categorys,difficultyLevel,highScore)

    if(lost === false)
    {
      $("path").on('click',function(){
        console.log($(this).attr('name'))
        countryClicked = findCountry($(this).attr('name'),europeanCountries)
        if(countryClicked.name.common === country.name.common)
        {
          score += 1000
          if(score > highScore)
            highScore = score
          country = updateUI(lives,score,category,categorys,difficultyLevel,highScore)
          $('.HUD').append('<p>CORRECT!</p>')
        }
        else
        {
          lives --
          country = updateUI(lives,score,category,categorys,difficultyLevel)
          $('.HUD').append('<p>INCORRECT</p>')
        }

        if(lives <= 0)
        {
          lost = true
          $('.retry').show()
        }

        if(score >= 5000 && difficultyLevel != 2)
          difficultyLevel++
      })
    }

    $(".retry").on('click',function(){
      console.log("here")
      lives = 3
      score = 0 
      difficultyLevel = 1
      country = updateUI(lives,score,category,categorys,difficultyLevel)
      lost = false
      $(".retry").hide();
    })
}
  