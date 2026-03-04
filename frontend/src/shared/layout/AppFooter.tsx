import InstagramButton from "@/shared/ui/InstagramButton";

const footerPhrase = "La imaginación,la habilidad, la creacion. Arte que luce tanto o mas que el oro y la plata.Embellecete con una pieza de arte hecha a mano. Se diferente";

export default function AppFooter() {
  return (
    <footer className="border-t border-earth-brown bg-cream/95 px-4 py-6 text-center">
      <div className="mx-auto flex w-full max-w-360 flex-col items-center gap-4">
        <p className="app-title text-lg font-bold text-black md:text-xl">
          {footerPhrase}
        </p>

        <InstagramButton />
      </div>
    </footer>
  );
}