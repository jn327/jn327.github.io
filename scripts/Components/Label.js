//Make sure you have the common elements creator added!
//CommonElementsCreator.addStyles(["label"]);

Label = function( parentElement, value )
{
  if (value == undefined)
  {
    value = '';
  }

  this.element            = document.createElement('div');
  this.element.innerText  = value;
  this.element.className  = "label";

  parentElement.appendChild( this.element );
}
