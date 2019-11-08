PeriodicFunctions = {};

//lerp from 0 to amplitude over a time of frequency
PeriodicFunctions.sawTooth = function(t, frequency, amplitude, offset)
{
  if (frequency == undefined){ frequency = 1; }
  if (amplitude == undefined) { amplitude = 1; }
  if (offset == undefined) { offset = 0; }

  return (((offset + t) % frequency) / frequency) * amplitude;
};

//wave starting at 0, going up to 1 and then heading back down to 0
PeriodicFunctions.wave = function(t, offset, frequency, amplitude)
{
  if (amplitude == undefined) { amplitude = 1; }

  return amplitude - PeriodicFunctions.inverseWave(t, offset, frequency, amplitude);
};

//wave starting at 1, going down to 0 and then heading back up to 1
PeriodicFunctions.inverseWave = function(t, offset, frequency, amplitude)
{
  if (frequency == undefined) { frequency = 1; }
  if (amplitude == undefined) { amplitude = 1; }
  if (offset == undefined) { offset = 0; }

  return (0.5 * amplitude) + (Math.cos(((t + offset)/frequency) * 2 * Math.PI) * (0.5*amplitude));
};
