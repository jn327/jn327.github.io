//Lets you define a list of keyframes with calls to addKeyFrame, use evaluate to get the value of the curve at a given point
//one oddity is that the first keyframe added can have an easing function but it'll be meaningless
//list of keyframes should always be ordered from lowest t to highest t and two keyframes can't be added at the same point.
function AnimationCurve()
{
	this.keyFrames = [];

	this.addKeyFrame = function(t, value, easingFunct, controlP)
  {
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
					console.error("AnimationCurve: addkeyFrame: there is already a keyframe at t = "+t);
				}

				//if this keyframe is further along than the frame we're about to add, then insert before this keyframe.
				if (theFrame.t > t)
				{
					sortedIndex = i;
					i = l;
				}
			}
		}

    this.keyFrames.splice( sortedIndex, 0, { easing:easingFunct, t:t, endValue:value, controlPoints:controlP } );
  }

	this.evaluate = function (t)
	{
		var l = this.keyFrames.length;
		if (l < 2)
		{
			console.error("AnimationCurve: evaluate: number of keyframes must be 2 or more, cannot evaluate");
		}

		//find stop at t.
		var prevFrame = this.keyFrames[0];
		var theFrame;
		for (var i = 1; i < l; i++)
		{
			theFrame = this.keyFrames[i];

			//if t is between the previous and next frames.
			if ( t >= prevFrame.t && t <= theFrame.t ||
			 	t <= prevFrame.t && t >= theFrame.t )
			{
				var prevVal		= prevFrame.endValue;
				var currVal		= theFrame.endValue;
				var currT			= t - prevFrame.t;
				var deltaT		= theFrame.t - prevFrame.t;
				var tNormal		= currT / deltaT;

				if (theFrame.easing != undefined)
				{
					// t: current time, b: beginning value, c: change in value, d: duration - function (t, b, c, d)
					tNormal = theFrame.easing( tNormal, 0, 1, 1);
				}

				var points = [ prevVal ];
				if (theFrame.controlPoints != undefined)
				{
					points = points.concat(theFrame.controlPoints);
				}
				points.push( currVal );
				return BezierUtil.evaluate(points, tNormal, false);
			}

			prevFrame = this.keyFrames[i];
		}

		console.error("AnimationCurve: evaluate: t ("+t +") is out of bounds.")
	}
}
