const BirdDisplay = () => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="basis-2/4 h-40 w-auto flex-shrink-0">
                <img
                    className='h-30 rounded-sm w-auto m-auto'
                    src="https://i.natgeofe.com/k/afe51970-80c6-46c3-b047-4c407c72d874/bald-eagle-closeup_square.jpg" alt="" />
            </div>
            <div className='basis-2/4 bg-transparent flex flex-col outline-2 outline-offset-2 rounded-md space-y-3 p-3 w-full'>
                <span className='text-center'>Bird Information</span>
                <span><b>Name:</b> goldfinch</span>
                <span><b>Scientific name:</b> Carduelis carduelis</span>
                <span><b>Fun fact:</b> Goldfinches are known for their bright red faces and melodic songs.</span>
                <span><b>rare type:</b> Common Flock</span>
                <span><b>Score:</b> 5</span>
            </div>
        </div>
    );
}

export default BirdDisplay;