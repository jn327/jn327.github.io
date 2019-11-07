//Requires 'Utils/ColorUtil' & 'Utils/EasingUtil'

//Lets you define a list of keyframes with calls to addKeyFrame.
//Colors are expected and returned in the format of [r,g,b].
//You can then evaluate the gradient for a given point and it'll return a lerped and eased value for the gradient at said point.
//this is basically just a list of points and we esentially ride on the back of the color util lerp.
//one oddity is that the first keyframe added can have an easing function defined for it but it'll be meaningless
//list of keyframes should always be ordered from lowest t to highest t.
//bear in mind that you cant add two keyframes at the same point, why would you want to do this?...
function Gradient()
{
	this.keyFrames = [];

	//add a point along the curve.
	this.addKeyFrame = function(t, value, easingFunct)
  {
		if (easingFunct == undefined)
		{
			easingFunct = EasingUtil.easeNone;
		}

		var l = this.keyFrames.length;
		var sortedIndex = l;
		if (l >= 1)
		{
			var theFrame;
			for (var i = 0; i < l; i++)
			{
				theFrame = this.keyFrames[i];

				if (t == theFrame.t)
				{
					console.error("Gradient: addkeyFrame: there is already a keyframe at t = "+t);
				}

				//if this keyframe is further along than the frame we're about to add, then insert before this keyframe.
				if (theFrame.t > t)
				{
					sortedIndex = i;

					i = l;
				}
			}
		}

    this.keyFrames.splice( sortedIndex, 0, { easing:easingFunct, t:t, endValue:value } );
  }

	this.evaluate = function (t)
	{
		var l = this.keyFrames.length;
		if (l < 2)
		{
			console.error("Gradient: evaluate: number of keyframes must be 2 or more, cannot evaluate");
		}

		//find stop at t and do the easing function....
		var prevFrame = this.keyFrames[0];
		var theFrame;
		for (var i = 1; i < l; i++)
		{
			theFrame = this.keyFrames[i];

			//if t is between the previous and next frames.
			if ( t >= prevFrame.t && t <= theFrame.t ||
			 	t <= prevFrame.t && t >= theFrame.t )
			{
				var currT			= t - prevFrame.t;
				var deltaT		= theFrame.t - prevFrame.t;

				// t: current time, b: beginning value, c: change in value, d: duration - function (t, b, c, d)
				var easedVal = theFrame.easing( currT, 0, 1, deltaT );

        return ColorUtil.lerp(easedVal, prevFrame.endValue, theFrame.endValue);
			}

			//update the previous frame.
			prevFrame = this.keyFrames[i];
		}

		console.error("Gradient: evaluate: t ("+t +") is out of bounds.")
	}
}
