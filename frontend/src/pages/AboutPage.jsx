import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#05100D]" data-testid="about-page">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-end pb-20">
        <div className="absolute inset-0">
          <img 
            src="https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/smtxt9or_chl.jpg"
            alt="L'équipe Chez Loman"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05100D] via-[#05100D]/70 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-2xl"
          >
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-4 block">
              Notre Histoire
            </span>
            <h1 className="text-5xl md:text-7xl text-[#F9F7F2] leading-tight">
              L'Âme de la<br/>
              <span className="font-accent italic">Cuisine Ivoirienne</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl text-[#F9F7F2] mb-8">
                Une Passion Transmise de Génération en Génération
              </h2>
              <div className="space-y-6 text-[#A3B1AD] leading-relaxed">
                <p>
                  Chez Loman est né d'une passion profonde pour la cuisine ivoirienne authentique. 
                  Notre restaurant est un hommage aux saveurs qui ont bercé notre enfance, 
                  aux recettes transmises par nos mères et grands-mères.
                </p>
                <p>
                  Situé au cœur de Yopougon, nous avons créé un espace où la tradition 
                  rencontre l'excellence. Chaque plat est préparé avec des ingrédients 
                  soigneusement sélectionnés et un savoir-faire qui respecte les techniques 
                  ancestrales tout en y apportant une touche de modernité.
                </p>
                <p>
                  Notre mission est simple : vous faire voyager à travers les saveurs 
                  de la Côte d'Ivoire, dans un cadre chaleureux où vous vous sentirez 
                  comme chez vous.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/ha2l407l_cv.jpg"
                alt="Plat signature"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-8 -left-8 glass p-6 rounded-2xl gold-border">
                <img 
                  src="https://customer-assets.emergentagent.com/job_chezloman/artifacts/dn3n27hs_Design%20sans%20titre.png"
                  alt="Chez Loman"
                  className="h-16 w-16 object-cover rounded-full border-2 border-[#D4AF37]/50"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32 bg-[#1A4D3E]/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.3em] mb-4 block">
              Nos Valeurs
            </span>
            <h2 className="text-4xl md:text-5xl text-[#F9F7F2]">
              Ce Qui Nous Guide
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Authenticité",
                description: "Des recettes traditionnelles respectées, transmises de génération en génération."
              },
              {
                title: "Excellence",
                description: "Une quête permanente de la qualité, des ingrédients à la présentation."
              },
              {
                title: "Hospitalité",
                description: "Un accueil chaleureux où chaque client est traité comme un membre de la famille."
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="luxury-card p-8 rounded-2xl text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-[#D4AF37]/30 flex items-center justify-center">
                  <span className="text-[#D4AF37] text-2xl font-accent italic">{index + 1}</span>
                </div>
                <h3 className="text-xl text-[#F9F7F2] mb-4">{value.title}</h3>
                <p className="text-[#A3B1AD] leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Family */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_b5c0ff47-ce71-407d-b22b-390360e9dd58/artifacts/07tbw3nn_cc.jpg"
                alt="Ambiance familiale"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl text-[#F9F7F2] mb-8">
                Un Lieu Pour Toute la Famille
              </h2>
              <div className="space-y-6 text-[#A3B1AD] leading-relaxed">
                <p>
                  Chez Loman, nous accueillons tout le monde avec le même sourire : 
                  familles avec enfants, groupes d'amis, collègues de travail ou voyageurs 
                  en quête de découvertes culinaires.
                </p>
                <p>
                  Notre espace a été pensé pour que chacun se sente à l'aise. 
                  Que ce soit pour un déjeuner rapide entre deux rendez-vous, 
                  un dîner romantique ou une grande tablée pour fêter un événement, 
                  nous sommes là pour rendre chaque moment spécial.
                </p>
              </div>
              <p className="text-3xl font-accent italic text-[#D4AF37] mt-10">
                "Viens goûter, tu vas comprendre"
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-[#1A4D3E]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl text-[#F9F7F2] mb-6">
              Venez Nous Découvrir
            </h2>
            <p className="text-lg text-[#F9F7F2]/70 mb-10 max-w-2xl mx-auto">
              Nous vous attendons à Yopougon Abobo Doumé pour vous faire découvrir 
              les saveurs authentiques de la cuisine ivoirienne
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/2250709508819?text=Bonjour, je souhaite réserver une table"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="btn-gold text-lg">
                  Réserver une Table
                </Button>
              </a>
              <a href="tel:+2250709508819">
                <Button className="bg-transparent border border-[#F9F7F2]/30 text-[#F9F7F2] hover:bg-[#F9F7F2] hover:text-[#1A4D3E] rounded-full px-10 py-4 font-medium transition-all duration-400">
                  Appeler Maintenant
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
