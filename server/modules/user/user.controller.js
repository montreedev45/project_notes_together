const profile = (req, res)=>{
    res.json({
        user: req.user
    })
}

export default profile;