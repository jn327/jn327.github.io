//Make sure you have the common elements creator added!
CommonElementsCreator.addStyles(["slider"]);

Slider = function( parentElement, value )
{
  if (value == undefined)
  {
    value = 0;
  }

  this.element            = document.createElement('input');
  this.element.type       = "range";
  this.element.min        = 0;
  this.element.max        = 100;
  this.element.value      = value;
  this.element.className  = "slider";

  parentElement.appendChild( this.element );
}
