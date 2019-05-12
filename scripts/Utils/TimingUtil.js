var TimingUtil = {};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds.
TimingUtil.debounce = function(func, time)
{
  var timer;
  return function()
  {
    if(timer)
    {
      clearTimeout(timer);
    }
    timer = setTimeout(func, time);
  };
}
