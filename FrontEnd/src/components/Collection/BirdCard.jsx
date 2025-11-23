import { Trophy } from 'lucide-react';

const BirdCard = ({ bird, imgUrl, onClick }) => {
    const owned = Boolean(imgUrl);
    const found = imgUrl ? "ring-4 ring-green-400 shadow-[0_0_20px_rgba(34,197,94,0.7)]" : "";


    return (
        <div 
            onClick={onClick}
            className={`cursor-pointer relative flex flex-col ml-auto mr-auto h-[300px] w-[250px] rounded-md outline-2 outline-offset-2 outline-gray-500 p-1 ${found}`}>
            
            {imgUrl && (
                <div className="absolute top-3 left-0 bg-green-600 text-white px-2 py-1 text-xs font-bold rotate-[-20deg] origin-left z-20 ">
                    Collected
                </div>
            )}

            <div
                id="bird-img"
                style={{
                    backgroundImage: `url(${imgUrl || 'https://media.craiyon.com/2025-04-19/gq-oKnq0RDOFMxdozodtYA.webp'})`,
                }}
                className="ml-auto mr-auto h-[85%] w-[90%] rounded-sm bg-cover bg-center relative"
            >
                <div className="absolute bottom-0 bg-gradient-to-r from-black/60 to-black/10 h-10 flex items-center px-2 w-full">
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
};

export default BirdCard;