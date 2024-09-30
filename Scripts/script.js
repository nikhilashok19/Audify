let isFocus=false;
document.querySelector('.mid').addEventListener('click',(event)=>{
  event. stopPropagation();
  document.querySelector('.mid').classList.add('focus');
  isFocus=true;
});

document.body.addEventListener('click',()=>{
  if(isFocus){
    document.querySelector('.mid').classList.remove('focus');
  }
});
