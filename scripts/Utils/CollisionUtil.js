var CollisionUtil = {};

CollisionUtil.pointInPolygon = function(point, vertices) {
    var inside = false;
    for (var i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        let verticeI = vertices[i];
        let verticeJ = vertices[j];

        var intersect = ((verticeI.y > point.y) != (verticeJ.y > point.y)) &&
            (point.x < (verticeJ.x - verticeI.x) * (point.y - verticeI.y) / (verticeJ.y - verticeI.y) + verticeI.x);
        
        if (intersect) inside = !inside;
    }

    return inside;
}