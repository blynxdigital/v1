const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('fast-csv'); 

(async () => {
    //returns Likes urls from a facebook  page
  const browser = await puppeteer.launch({ headless: true});
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({Referer: 'https://sparktoro.com/'}) 
  await page.goto('https://www.facebook.com/dipankar.gupta.1293');
  const likesUrlFromFbPage = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('span.visible > a'))
    return links.map(link => link.href)
  });  
  const allLikesUrlString = likesUrlFromFbPage;
  //Stored all likes urls in an array
  const allLikesUrlArray = String(allLikesUrlString).split(',');

  const hiddenLikesUrl = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('span.hiddenItem > a'))
    return links.map(link => link.href)
  });
  const hiddenLikesString = hiddenLikesUrl;
  const hiddenLikesArray = String(hiddenLikesString).split(',');
  
// hidden likes url is appended in the visible likes url array

//   for (var a in hiddenLikesArray){
//         allLikesUrlArray.push(hiddenLikesArray[a]);
//     }
    
    //Appends hidden likes in like's array
    for (var a in allLikesUrlArray)
    {
        var variable = allLikesUrlArray[a];
        //console.log(variable)
    }

    var arrayToExportData = [];
    //filters category of the likes(keywords) and the name of the likes(keywords) from each url
    for (var a in allLikesUrlArray)
    {
        var categoryArray = [];
        var variable = allLikesUrlArray[a];
        //split each url based on '/' separator and pick the 3rd last word from each url
        //as last word is a comma and second last character is "/"
        var wordsOfLikesUrl = variable.split("/");
        //fetches Like's keyword
        var likesKeyword = wordsOfLikesUrl[wordsOfLikesUrl.length - 2];
        //console.log(likesKeyword);

        //scraping the likes url to fetch category of each like
        await page.goto(variable);  

        const categoryUrl = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'))
            return links.map(link => link.href)
            })
        var allLikePageUrl = String(categoryUrl).split(',');
        for(var url in allLikePageUrl)
        {
            var likesUrlData = allLikePageUrl[url];
            if(likesUrlData.includes('/category/'))
            {
                var tempLikesKeyword;
                categoryArray.push(likesUrlData);
                var categorySplitArray = String(categoryArray).split('/');
                var categoryWords = categorySplitArray[categorySplitArray.length -2];
                //if(tempLikesKeyword )
                if(tempLikesKeyword != likesKeyword){
                    //console.log('likesKeyword'+likesKeyword + ',' + 'tempLikesKeyword' + tempLikesKeyword);
                    if(categoryWords != 'category'){
                        arrayToExportData.push(likesKeyword + ',' + variable + ',' + categoryWords);
                        tempLikesKeyword = likesKeyword;
                    }
                }
                //console.log(likesUrlData);
            }
        }
        fs.appendFile('allUrl.txt', categoryUrl, function(err, contents) {
            //console.log(err);
        });
        //console.log(variable)
    }

    // data export process in csv file format
    var header =["Keyword","Url","Category"];
    i = 0, k = 0,
    obj = null,
    output = [];
    //conversion of data in json format
    for (i = 0; i < arrayToExportData.length ; i++) {
        obj = {};
        var elementAtPlace = arrayToExportData[i];
        console.log(elementAtPlace);
        var splittedArray=elementAtPlace.split(',');
        // console.log(splittedArray);
        for (k = 0; k < header.length ; k++) {
            var splittedKey = header[k];
            // console.log(splittedKey);
            obj[splittedKey] = splittedArray[k];
        }
        output.push(obj);
        //console.log(obj);     
    }
        var csvStream = csv.format({headers: true}),
        writableStream = fs.createWriteStream("my.csv");
        writableStream.on("finish", function(){
        console.log("DONE!");
    }); 

        csvStream.pipe(writableStream);
        for(var a in output)
        {
            var data = output[a];
            console.log(data);
            csvStream.write(data);
        }


await browser.close();
})();