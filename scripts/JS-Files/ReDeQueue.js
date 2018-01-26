function DeQueue() {
    this._front = 0;
    this._back = 0;
	this._storage = {};
	if (arguments.length == 1 && arguments[0] instanceof Array) {
		this._storage = arguments[0];
		this._back = this._storage.length;
	} 
}
 
DeQueue.prototype.size = function() {
    return this._back - this._front;
};
 
DeQueue.prototype.enqueue = function(data) {
    this._storage[this._back] = data;
    this._back++;
};
 
DeQueue.prototype.dequeue = function() {
    var front = this._front,
        back = this._back,
        deletedData;
 
    if (front !== back) {
        deletedData = this._storage[front];
        delete this._storage[front];
        this._front++;
 
        return deletedData;
    }
};

DeQueue.prototype.addToFront = function (data) {
	if (this.front > 0) {
        this._storage[--this.front] = data;
    }
}

DeQueue.prototype.popBack = function (data) {
	var back = this._back,
		front = this._front,
        deletedData;
 
    if (back != front) {
        deletedData = this._storage[back];
 
        delete this._storage[back];
        --this._back;
 
        return deletedData;
    }
}

DeQueue.prototype.getArray = function () {
	if (this._storage instanceof Array) {
		var storage = this._storage
		return storage;
	}
	else return [];
}