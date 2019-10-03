//Make sure you have the common elements creator added!
Canvas = function( parentElement, className )
{
  if (parentElement == undefined)
  {
    parentElement = CommonElementsCreator.defaultCanvasParent;
  }

  if (className == undefined)
  {
    className = "defaultCanvas";
  }

  this.element = document.createElement("canvas");
  this.element.className = className;
  parentElement.insertBefore(this.element, parentElement.firstChild);
}
