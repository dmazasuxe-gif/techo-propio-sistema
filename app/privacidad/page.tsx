import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-[family-name:var(--font-work-sans)]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-montserrat)]">
          AVISO DE PRIVACIDAD Y POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES
        </h1>
        <p className="text-xl text-slate-400 mb-2 font-bold">CONSTRUCTORA MAZA QUIROZ E.I.R.L.</p>
        <p className="text-sm text-slate-500 mb-12">Última actualización: 11 de agosto de 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. IDENTIFICACIÓN DE LA EMPRESA</h2>
            <p className="mb-2">El presente Aviso de Privacidad y Política de Protección de Datos Personales corresponde al sitio web de <strong>CONSTRUCTORA MAZA QUIROZ E.I.R.L.</strong>, en adelante, <strong>“LA EMPRESA”</strong>.</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Razón social:</strong> CONSTRUCTORA MAZA QUIROZ E.I.R.L.</li>
              <li><strong>RUC:</strong> 20607520357</li>
              <li><strong>Domicilio:</strong> Jr. Iquitos N.° 149</li>
              <li><strong>Correo electrónico:</strong> <a href="mailto:mazaquiroz24@gmail.com" className="text-sky-400 hover:underline">mazaquiroz24@gmail.com</a></li>
              <li><strong>Teléfono:</strong> 985863448</li>
              <li><strong>Sitio web:</strong> <a href="https://techo-propio-sistema.vercel.app/" className="text-sky-400 hover:underline">https://techo-propio-sistema.vercel.app/</a></li>
            </ul>
            <p>LA EMPRESA desarrolla sus actividades en la República del Perú y, cuando corresponda, se encuentra sujeta a la <strong>Ley N.° 29733, Ley de Protección de Datos Personales</strong>, y a su Reglamento aprobado mediante <strong>Decreto Supremo N.° 016-2024-JUS</strong>, además de las demás normas aplicables.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. FINALIDAD DE ESTE AVISO</h2>
            <p className="mb-2">El presente documento tiene como finalidad informar a los visitantes del sitio web sobre el tratamiento de datos personales que eventualmente pudiera producirse como consecuencia del uso de la página.</p>
            <p>LA EMPRESA respeta el derecho fundamental a la protección de los datos personales reconocido por la legislación peruana.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. NATURALEZA DEL SITIO WEB</h2>
            <p className="mb-2">El sitio web de LA EMPRESA funciona principalmente como una <strong>landing page informativa y corporativa</strong>, destinada a presentar información sobre la empresa, sus actividades, proyectos, servicios, productos y demás información relacionada con su actividad empresarial.</p>
            <p className="mb-2">Actualmente, el sitio web <strong>no cuenta con formularios de registro, formularios de contacto, formularios de cotización, cuentas de usuario ni mecanismos destinados a recopilar y almacenar directamente datos personales de los visitantes.</strong></p>
            <p>Por ello, un visitante puede navegar por el contenido público del sitio sin necesidad de proporcionar voluntariamente sus datos personales.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. DATOS PERSONALES RECOPILADOS DIRECTAMENTE POR EL SITIO WEB</h2>
            <p className="mb-2">Actualmente, LA EMPRESA <strong>no recopila directamente mediante formularios o sistemas de registro del sitio web datos personales como nombres, apellidos, DNI, teléfonos, direcciones, correos electrónicos u otros datos similares de los visitantes.</strong></p>
            <p>En consecuencia, la landing page no requiere actualmente que el visitante cree una cuenta, se registre o complete un formulario para acceder a su contenido público.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. INFORMACIÓN TÉCNICA Y DATOS DE NAVEGACIÓN</h2>
            <p className="mb-2">Aunque LA EMPRESA no solicite directamente datos personales mediante formularios, determinados servicios tecnológicos utilizados para alojar, proteger, mantener o analizar un sitio web pueden generar información técnica relacionada con la navegación.</p>
            <p className="mb-2">Dependiendo de la configuración efectiva del sitio y de los servicios tecnológicos utilizados, dicha información podría comprender elementos como:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Dirección IP.</li>
              <li>Tipo de navegador.</li>
              <li>Sistema operativo.</li>
              <li>Tipo de dispositivo.</li>
              <li>Fecha y hora de acceso.</li>
              <li>Información técnica relacionada con la conexión.</li>
              <li>Registros técnicos necesarios para la seguridad y funcionamiento del sitio.</li>
            </ul>
            <p className="mb-2">Esta información no debe interpretarse automáticamente como información que LA EMPRESA recopile deliberadamente para identificar individualmente a los visitantes.</p>
            <p>Cuando dichos datos sean tratados por proveedores tecnológicos, el tratamiento estará sujeto también a las condiciones y políticas aplicables de dichos proveedores.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. COOKIES Y TECNOLOGÍAS SIMILARES</h2>
            <p className="mb-2">El sitio web podría utilizar cookies u otras tecnologías similares necesarias para su funcionamiento, seguridad, rendimiento o determinadas funcionalidades.</p>
            <p className="mb-2">Las cookies son pequeños archivos o mecanismos tecnológicos que pueden almacenarse en el dispositivo del visitante y permitir determinadas funcionalidades o recopilar información relacionada con la navegación.</p>
            <p className="mb-2">Actualmente, LA EMPRESA no utiliza la página web con el propósito de solicitar directamente datos personales mediante formularios.</p>
            <p className="mb-2">No obstante, determinados servicios de terceros integrados en el sitio podrían utilizar sus propias cookies o tecnologías similares.</p>
            <p>Cuando corresponda, el visitante podrá gestionar determinadas cookies mediante la configuración de su navegador o mediante los mecanismos de consentimiento que se implementen en el sitio.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. SERVICIOS Y PLATAFORMAS DE TERCEROS</h2>
            <p className="mb-2">El sitio web puede utilizar servicios tecnológicos proporcionados por terceros para funciones tales como:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Alojamiento web.</li>
              <li>Seguridad.</li>
              <li>Distribución de contenido.</li>
              <li>Estadísticas.</li>
              <li>Análisis técnico.</li>
              <li>Integración de contenidos.</li>
              <li>Reproducción de vídeos.</li>
              <li>Mapas.</li>
              <li>Redes sociales.</li>
              <li>Otros servicios necesarios para el funcionamiento del sitio.</li>
            </ul>
            <p className="mb-2">Estos terceros pueden procesar determinada información técnica de acuerdo con sus propias políticas y condiciones.</p>
            <p>LA EMPRESA no controla necesariamente las prácticas de privacidad de dichos terceros y recomienda revisar sus respectivas políticas cuando el visitante utilice servicios proporcionados por ellos.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. AUSENCIA DE FORMULARIOS Y REGISTRO DE USUARIOS</h2>
            <p className="mb-2">Actualmente, el sitio web no ofrece:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Registro de usuarios.</li>
              <li>Creación de cuentas.</li>
              <li>Inicio de sesión.</li>
              <li>Formularios de contacto.</li>
              <li>Formularios de cotización.</li>
              <li>Formularios de suscripción.</li>
              <li>Formularios de comentarios.</li>
              <li>Formularios para recopilación de DNI.</li>
              <li>Formularios para recopilación de datos de clientes.</li>
            </ul>
            <p>Por lo tanto, el visitante puede consultar la información pública del sitio sin proporcionar directamente este tipo de información.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. COMUNICACIÓN MEDIANTE CANALES EXTERNOS</h2>
            <p className="mb-2">LA EMPRESA puede proporcionar en su sitio web información de contacto, como número telefónico, correo electrónico, WhatsApp u otros medios de comunicación.</p>
            <p className="mb-2">Si el visitante decide voluntariamente comunicarse con LA EMPRESA utilizando alguno de estos medios, podrá proporcionar datos personales como su nombre, teléfono, correo electrónico u otra información necesaria para atender su comunicación.</p>
            <p className="mb-2">En ese supuesto, los datos proporcionados dejarán de corresponder únicamente a la navegación anónima de la landing page y podrán ser tratados por LA EMPRESA para atender la comunicación, consulta, solicitud o relación comercial correspondiente, de acuerdo con la legislación aplicable.</p>
            <p>Cuando el contacto se realice mediante una plataforma de terceros, como WhatsApp, el tratamiento también podrá estar sujeto a las condiciones y políticas de privacidad de dicha plataforma.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. FINALIDAD DEL TRATAMIENTO CUANDO EL USUARIO CONTACTA VOLUNTARIAMENTE A LA EMPRESA</h2>
            <p className="mb-2">Cuando una persona decida comunicarse voluntariamente con LA EMPRESA mediante correo electrónico, teléfono, WhatsApp u otro canal habilitado, la información proporcionada podrá ser utilizada exclusivamente para finalidades relacionadas con la comunicación realizada, tales como:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Responder consultas.</li>
              <li>Brindar información sobre los servicios.</li>
              <li>Atender solicitudes.</li>
              <li>Preparar o evaluar solicitudes comerciales.</li>
              <li>Coordinar reuniones.</li>
              <li>Atender solicitudes relacionadas con proyectos.</li>
              <li>Mantener una comunicación relacionada con una eventual relación comercial.</li>
            </ul>
            <p>Cuando corresponda, el tratamiento de datos se realizará sobre la base jurídica que resulte aplicable conforme a la Ley N.° 29733 y su Reglamento.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. PRINCIPIOS DE PROTECCIÓN DE DATOS</h2>
            <p className="mb-2">Cuando LA EMPRESA realice un tratamiento de datos personales, procurará cumplir los principios establecidos por la normativa peruana de protección de datos personales, incluyendo los principios de:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Legalidad.</li>
              <li>Consentimiento, cuando corresponda.</li>
              <li>Finalidad.</li>
              <li>Proporcionalidad.</li>
              <li>Calidad.</li>
              <li>Seguridad.</li>
              <li>Disposición de recurso.</li>
              <li>Nivel de protección adecuado.</li>
            </ul>
            <p>La Ley N.° 29733 establece, entre otros aspectos, que los datos deben recopilarse para una finalidad determinada, explícita y lícita, y que su tratamiento debe ser adecuado, relevante y no excesivo respecto de dicha finalidad.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. CONSENTIMIENTO</h2>
            <p className="mb-2">LA EMPRESA no solicita actualmente consentimiento mediante formularios dentro de la landing page porque no utiliza dichos formularios para recopilar datos personales.</p>
            <p className="mb-2">Si en el futuro se implementan mecanismos de recopilación de datos personales que requieran consentimiento, LA EMPRESA implementará los mecanismos correspondientes antes o en el momento en que resulte exigible conforme a la legislación aplicable.</p>
            <p>El Reglamento de la Ley N.° 29733 establece reglas sobre el consentimiento previo, expreso, inequívoco e informado.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. BANCO DE DATOS PERSONALES</h2>
            <p className="mb-2">Actualmente, la landing page no cuenta con un formulario de registro o mecanismo equivalente destinado a crear un banco de datos personales de visitantes del sitio.</p>
            <p className="mb-2">Por tal motivo, <strong>este Aviso no asigna ni declara un código de inscripción de banco de datos personales para la landing page.</strong></p>
            <p className="mb-2">Si en el futuro LA EMPRESA implementa un sistema que implique la creación de un banco de datos personales sujeto a inscripción, realizará las gestiones correspondientes ante el <strong>Registro Nacional de Protección de Datos Personales</strong>, de acuerdo con la legislación vigente.</p>
            <p>La Autoridad Nacional de Protección de Datos Personales establece que la obligación de inscripción corresponde a quien sea titular de un banco de datos personales.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. SEGURIDAD</h2>
            <p className="mb-2">Cuando LA EMPRESA trate datos personales, adoptará las medidas de seguridad que resulten razonables y apropiadas de acuerdo con la naturaleza del tratamiento y los riesgos correspondientes.</p>
            <p>Estas medidas estarán destinadas a evitar, dentro de lo razonablemente posible, accesos no autorizados, pérdida, alteración, divulgación indebida o tratamiento no autorizado de información personal.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. CONSERVACIÓN DE DATOS</h2>
            <p className="mb-2">Debido a que la landing page actualmente no recopila directamente datos personales mediante formularios o registros, no existe un período de conservación asociado a un registro de usuarios de la página.</p>
            <p>Cuando una persona contacte voluntariamente a LA EMPRESA por correo electrónico, teléfono, WhatsApp u otro canal, cualquier información personal proporcionada podrá conservarse durante el tiempo necesario para atender la comunicación o mientras exista una finalidad legítima que justifique su conservación, además de los plazos que puedan resultar exigibles por ley.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">16. DERECHOS DE LOS TITULARES DE DATOS PERSONALES</h2>
            <p className="mb-2">Cuando LA EMPRESA trate datos personales de una persona, esta podrá ejercer los derechos reconocidos por la legislación peruana, incluyendo los derechos de:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Acceso:</strong> conocer qué datos personales son objeto de tratamiento y determinada información relacionada con dicho tratamiento.</li>
              <li><strong>Rectificación:</strong> solicitar la corrección o actualización de datos personales inexactos, incompletos o desactualizados.</li>
              <li><strong>Cancelación:</strong> solicitar la eliminación de datos personales cuando corresponda legalmente.</li>
              <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos personales cuando resulte aplicable.</li>
            </ul>
            <p>Estos derechos son conocidos como derechos ARCO y forman parte de las garantías reconocidas por la Ley N.° 29733.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">17. EJERCICIO DE DERECHOS</h2>
            <p className="mb-2">El titular de datos personales podrá presentar una solicitud relacionada con sus derechos mediante:</p>
            <p className="mb-2"><strong>Correo electrónico:</strong> <a href="mailto:mazaquiroz24@gmail.com" className="text-sky-400 hover:underline">mazaquiroz24@gmail.com</a></p>
            <p className="mb-2">La solicitud deberá permitir identificar razonablemente al solicitante y especificar el derecho que desea ejercer.</p>
            <p className="mb-2">LA EMPRESA podrá solicitar información adicional cuando sea necesaria para verificar la identidad del solicitante o atender correctamente la solicitud.</p>
            <p>Las solicitudes serán atendidas dentro de los plazos establecidos por la legislación peruana vigente.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">18. AUTORIDAD NACIONAL DE PROTECCIÓN DE DATOS PERSONALES</h2>
            <p>Si una persona considera que sus derechos relacionados con la protección de datos personales no han sido respetados, podrá recurrir ante la <strong>Autoridad Nacional de Protección de Datos Personales (ANPD)</strong> utilizando los mecanismos establecidos por la legislación peruana.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">19. MENORES DE EDAD</h2>
            <p className="mb-2">El sitio web es de carácter informativo y no está dirigido específicamente a la recopilación de datos personales de menores de edad.</p>
            <p>LA EMPRESA no solicita deliberadamente datos personales de menores mediante la landing page.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">20. ENLACES EXTERNOS</h2>
            <p className="mb-2">El sitio web puede contener enlaces hacia sitios web, redes sociales, plataformas o servicios externos.</p>
            <p className="mb-2">Una vez que el visitante abandone el sitio web de LA EMPRESA y acceda a una plataforma de terceros, las condiciones de privacidad y tratamiento de datos de dicha plataforma serán determinadas por el tercero correspondiente.</p>
            <p>LA EMPRESA no es responsable de las políticas, prácticas o contenidos de privacidad de sitios externos que no controle directamente.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">21. CAMBIOS EN ESTA POLÍTICA</h2>
            <p className="mb-2">LA EMPRESA podrá actualizar esta Política de Privacidad cuando:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Se incorporen nuevas funcionalidades al sitio web.</li>
              <li>Se implementen formularios.</li>
              <li>Se incorporen mecanismos de registro.</li>
              <li>Se incorporen herramientas de analítica o publicidad.</li>
              <li>Se incorporen cookies o tecnologías adicionales.</li>
              <li>Cambie la legislación aplicable.</li>
              <li>Cambie la forma en que se tratan los datos personales.</li>
              <li>Se implementen nuevos servicios tecnológicos.</li>
            </ul>
            <p className="mb-2">La versión actualizada será publicada en el sitio web indicando la fecha de su última actualización.</p>
            <p>Si una modificación implica un tratamiento que requiera consentimiento u otra obligación específica, LA EMPRESA implementará las medidas correspondientes antes de realizar dicho tratamiento.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">22. INFORMACIÓN Y TRANSPARENCIA</h2>
            <p className="mb-2">LA EMPRESA se compromete a mantener esta política de manera accesible para que los visitantes puedan conocer cómo se aborda la protección de datos personales en relación con el sitio web.</p>
            <p>La normativa peruana reconoce el derecho de las personas a recibir información sobre el tratamiento de sus datos personales y sobre aspectos como su finalidad, almacenamiento, comunicación y ejercicio de derechos.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">23. LEGISLACIÓN APLICABLE</h2>
            <p className="mb-2">Esta Política de Privacidad se rige por la legislación de la República del Perú.</p>
            <p className="mb-2">En particular, se consideran:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Constitución Política del Perú.</li>
              <li><strong>Ley N.° 29733, Ley de Protección de Datos Personales.</strong></li>
              <li><strong>Decreto Supremo N.° 016-2024-JUS, Reglamento de la Ley N.° 29733.</strong></li>
              <li>Normas, directivas y disposiciones emitidas por la Autoridad Nacional de Protección de Datos Personales.</li>
              <li>Demás normas peruanas que resulten aplicables.</li>
            </ul>
            <p>El nuevo Reglamento aprobado mediante D.S. N.° 016-2024-JUS se encuentra vigente desde el 31 de marzo de 2025.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">24. CONTACTO</h2>
            <p className="mb-2">Para cualquier consulta relacionada con esta Política de Privacidad o con el tratamiento de datos personales, puede comunicarse con:</p>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <p className="font-bold text-white mb-2">CONSTRUCTORA MAZA QUIROZ E.I.R.L.</p>
              <ul className="space-y-1">
                <li><strong>RUC:</strong> 20607520357</li>
                <li><strong>Domicilio:</strong> Jr. Iquitos N.° 149</li>
                <li><strong>Correo electrónico:</strong> <a href="mailto:mazaquiroz24@gmail.com" className="text-sky-400 hover:underline">mazaquiroz24@gmail.com</a></li>
                <li><strong>Teléfono:</strong> 985863448</li>
              </ul>
            </div>
            <p className="mt-8 text-sm text-slate-500">Última actualización: 11 de agosto de 2026.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
