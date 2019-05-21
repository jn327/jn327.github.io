function ObjectPool()
{
  var thePool = [];

  this.addToPool = function( object )
  {
    thePool.push( object );
  }

  this.getItem = function()
  {
    if (thePool.length > 0)
    {
      return thePool.pop();
    }

    return null;
  }
}
