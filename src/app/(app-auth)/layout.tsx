const Layout = (props: any) => {
  return (
    <body className="app">
      <div className="relative min-h-screen safe">
        <script dangerouslySetInnerHTML={{ __html: `window.isApplication = true;` }}></script>
        {props.children}
      </div>
    </body>
  );
};

export default Layout;
