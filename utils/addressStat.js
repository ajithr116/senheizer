
const districtWiseOrderCounts = async(req,res)=>{
    const districtWiseOrderCounts = await Order.aggregate([
        {
            $lookup:{
                from:'addresses',
                localField:'shippingAddressID',
                foreignField:'_id',
                as:'address'
            }
        },
        {
            $unwind:'$address'
        },
        {
            $group:{
                _id:'$address.state',
                totalDistrictOrder:{$sum:1}
            }
        }
    ])
    return districtWiseOrderCounts;   
}

module.exports={
    districtWiseOrderCounts,
}