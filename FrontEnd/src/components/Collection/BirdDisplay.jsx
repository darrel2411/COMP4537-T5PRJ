import { Button } from "@/components/ui/button";

const BirdDisplay = ({ bird, img, handleClose }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center" >
            <div className="basis-1/4 h-full w-auto flex-shrink-0">
                <img
                    className='h-50 rounded-sm w-auto m-auto'
                    src={img ? img : "https://i.natgeofe.com/k/afe51970-80c6-46c3-b047-4c407c72d874/bald-eagle-closeup_square.jpg"} alt="" />
            </div>
            <div className='basis-2/4 bg-transparent flex flex-col outline-2 outline-offset-2 rounded-md space-y-3 p-3 w-full'>
                <span className='text-center'>Bird Information</span>
                <span><b>Name:</b> {bird.name}</span>
                <span><b>Scientific name:</b> {bird.scientific_name}</span>
                <span><b>Fun fact:</b> {bird.fun_fact}</span>
                <span><b>rare type:</b> {bird.rare_type}</span>
                <span><b>Score:</b> {bird.score}</span>
            </div>
            <div>
                <Button onClick={handleClose} variant={'destructive'}>
                    <span>Close</span>
                </Button>
            </div>
        </div>
    );
}

export default BirdDisplay;