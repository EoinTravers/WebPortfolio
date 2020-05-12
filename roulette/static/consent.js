
var button, box, subject_nr;
function toggle_consent(val){
  if (box.checked == true)
  {
    button.style.display = "inline";
  }
  else
  {
    button.style.display = "none";
  }
  window.scrollTo(0,document.body.scrollHeight+5000);
}

window.onload = function(){
  subject_nr = Math.round(Math.random()*1000000000);
  localStorage['subject_nr'] = subject_nr;
  document.getElementById('subject_nr').value = subject_nr;

  button = document.getElementById("start_button");
  box = document.getElementById("consent_box");
  box.checked = false;
  for(var i =0;i<3;i++){
    document.getElementsByName('gender')[i].checked=false;
  }
};
