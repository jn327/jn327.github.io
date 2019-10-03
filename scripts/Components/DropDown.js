//Make sure you have the common elements creator added!
CommonElementsCreator.addStyles(["dropdown"]);

DropDown = function( parentElement, items, prefixText, selectedIndex, bAbove )
{
  if (selectedIndex == undefined)
  {
    selectedIndex = 0;
  }

  if (prefixText == undefined)
  {
    prefixText = "";
  }
  this.prefixText = prefixText;

  this.element = document.createElement('div');
  this.element.className = "dropdown";
  parentElement.appendChild( this.element );

  var btn = document.createElement('a');
  btn.className = "dropdown-button";
  this.element.appendChild( btn );

  this.itemsContainer = document.createElement('div');
  this.itemsContainer.className = "dropdown-itemsContainer";
  if (bAbove != undefined && bAbove == true)
  {
    this.itemsContainer.style.bottom = "100%";
  }
  this.element.appendChild( this.itemsContainer );

  this.selectedIndex = selectedIndex;
  this.items = [];
  var iItem;
  for (var i = 0; i < items.length; i++)
  {
    iItem = document.createElement('a');
    iItem.textContent = items[i];
    this.itemsContainer.appendChild( iItem );

    this.items.push(iItem);
  }

  this.validateText = function()
  {
    btn.textContent = this.prefixText + this.items[this.selectedIndex].textContent;
  }
  this.validateText();

  this.setSelectedIndex = function(index)
  {
    if(index != this.selectedIndex)
    {
      this.selectedIndex = index;
      this.validateText();
    }
  }

  this.hideItemsContainer = function()
  {
    //TODO: fix
    //this.itemsContainer.style.display = "none";
  }
}
