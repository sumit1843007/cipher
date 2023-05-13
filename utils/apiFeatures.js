class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {

        // console.log("filter function called");
        const queryObject = { ...this.queryString };

        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(field => delete queryObject[field]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => {
            return `$${match}`;
        });

        console.log(JSON.parse(queryStr));

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        //sorting
        if (this.queryString.sort) {

            const sortBy = this.queryString.sort.split(',').join(' ');
            //sort('price duration)
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
        }
        return this;
    }
    paginate() {

        // //paging
        const page = (+this.queryString.page) || 1;
        const limit = (+this.queryString.limit) || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;

    }
    fields() {
        // //fields
        if (this.queryString.fields) {

            const Fields = this.queryString.fields.split(',').join(' ');
            //sort('price duration)
            console.log(Fields);
            this.query = this.query.select(Fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

}
module.exports = APIFeatures;