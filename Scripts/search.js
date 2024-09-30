const searchBar=document.querySelector('.search-bar');
let searchValue='';

searchBar.addEventListener('keyup',(event)=>{
  searchValue=(searchBar.value).trim();
  performSearch(searchValue.toLocaleLowerCase());
  if(searchValue===''){
    generateHtml(artistsData);
  }
});

document.querySelector('.mid i').addEventListener('click',()=>{
  console.log(searchValue.toLocaleLowerCase(),searchValue);
  performSearch(searchValue.toLocaleLowerCase());
});

function performSearch(keyword){
  let results = [];
  let found=false;
  for (let i = 0; i < artistsData.length; i++) {
    const element = artistsData[i];
    if((element.name.toLocaleLowerCase()).includes(keyword)){
      results.push(element);
      found=true;
    }
  }
  if(found){
    if(artistContainer.classList.contains('artist-area-error')){
      artistContainer.classList.remove('artist-area-error');
    }
    generateHtml(results);
  }
  else{
    const noResult=`
    <div class="no-result">
      <h2>No Results Found</h2>
    </div>`;
    artistContainer.classList.add('artist-area-error');
    artistContainer.innerHTML=noResult;
  }
}




