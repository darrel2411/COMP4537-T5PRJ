import { Trophy } from 'lucide-react';

const BirdCard = ({ bird }) => {
    return(
        <div className='flex flex-col ml-auto mr-auto h-[300px] w-[250px] rounded-md outline-2 outline-offset-2 outline-gray-500 p-1'>
            <div
                id="bird-img"
                className="ml-auto mr-auto bg-[url('https://media.craiyon.com/2025-04-19/gq-oKnq0RDOFMxdozodtYA.webp')] h-[85%] w-[90%] rounded-sm bg-cover bg-center"
            >
                <div className="bg-gradient-to-r from-black/60 to-black/10 h-10 flex items-center px-2 text-center mt-auto  w-full">
                    <span className="text-white font-bold ml-auto mr-auto">{bird.rare_type}</span>
                </div>
            </div>
            <div className='flex flex-col gap-1'>
                <span className="text-center text-xl">{bird.name.toUpperCase()}</span>
                <div className="flex flex-row gap-3 items-center text-2xl w-full">
                    <span className='text-center ml-auto'>{bird.score}</span>
                    <Trophy />
                </div>
            </div>
        </div>
    );
}

export default BirdCard;