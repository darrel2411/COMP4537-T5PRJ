import BirdDisplay from '../../components/Collection/BirdDisplay';
import Navbar from "@/components/Navbar/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BirdCard from '@/components/Collection/BirdCard';
import { useState, useEffect } from 'react';
import LoadingPage from '@/components/utils/LoadingPage';
import { useUser } from "@/context/UserContext";


const CollectionPage = () => {
    const { user } = useUser();
    const [groupedBirds, setGroupedBirds] = useState({});
    const [birdTypes, setBirdTypes] = useState([]);
    const [collection, setCollection] = useState({});
    const [show, setShow] = useState(false);
    const [birdIdDisplayed, setBirdIdDisplayed] = useState('');
    const [bird, setBird] = useState([]);
    const [displayBirdImg, setDisplayBirdImg] = useState('');
    const [warning, setWarning] = useState('');
    const API_BASE = import.meta.env.VITE_API_BASE;
    

    useEffect(() => {
        const retrieveBirds = async () => {
            try {
                const response = await fetch(`${API_BASE}/get-birds?userId=${user.userId}`);

                const data = await response.json();

                if (data.ok) {
                    console.log(data);
                    setBirdTypes(data.birdTypes);
                    setGroupedBirds(data.groupedBirds)
                    setCollection(data.collections);
                }

            } catch (err) {
                console.log("Error retrieving birds")
            }
        }

        retrieveBirds();
    }, []);

    
    const retrieveInformation = async (birdId) => {

        try {
            console.log('BirdId to retrieve:', birdId)
            const response = await fetch(`${API_BASE}/get-bird-info?birdId=${birdId}`);
            const data = await response.json();

            if (data.ok) {
                setShow(true);
                setBird(data.bird);
                console.log('Bird information to display:', data);
            }

        } catch (error) {
            console.log("Error retrieving information")
        }
    }


    if (!birdTypes.length) return <LoadingPage />;

    return (
        <div className=" min-h-screen bg-gray-50">
            <Navbar />

            {warning && (
                <div className="bg-yellow-200 text-yellow-800 text-center py-2 font-semibold">
                    {warning}
                </div>
            )}

            {show && (
                <div>
                    <div className='flex flex-col p-5 space-y-4'>
                        <BirdDisplay bird={bird} img={displayBirdImg} />
                    </div>
                    <hr className="m-auto w-[95%]" />
                </div>

            )}
            <div className='mt-4 place-items-center justified-center text-center '>
                <Tabs defaultValue={(birdTypes[0]?.rare_type)} className="">
                    <TabsList className="">
                        {
                            birdTypes.map((element, index) => (
                                <TabsTrigger key={index} value={(element.rare_type)}>{element.rare_type}</TabsTrigger>
                            ))
                        }
                    </TabsList>
                    {birdTypes.map((type) => (
                        <TabsContent
                            key={type.rare_type_id}
                            value={type.rare_type}
                            className="flex flex-wrap justify-center gap-4 p-4"
                        >
                            {groupedBirds[type.rare_type_id].map((bird) => (
                                <BirdCard 
                                    key={bird.bird_id} 
                                    bird={bird} 
                                    imgUrl={collection[bird.bird_id]}
                                    onClick={async () => {
                                        if(collection[bird.bird_id]) {
                                            setWarning('');
                                            setBirdIdDisplayed(bird.bird_id);
                                            setDisplayBirdImg(collection[bird.bird_id]);
                                            await retrieveInformation(bird.bird_id);
                                        } else {
                                            setWarning('You do not own this bird yet.');
                                            setShow(false);
                                        }
                                    }}
                                />
                            ))}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

export default CollectionPage;